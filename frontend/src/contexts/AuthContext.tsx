import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, authService } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (cpf: string, senha: string, codigoVerificacao?: string) => Promise<any>;
  logout: () => void;
  revalidateUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUsuario = localStorage.getItem('usuario');

        console.log('🔍 AuthContext: Verificando localStorage...', {
          hasToken: !!storedToken,
          hasUsuario: !!storedUsuario,
          tokenLength: storedToken?.length,
          usuarioContent: storedUsuario?.substring(0, 50)
        });

        if (storedToken) {
          setToken(storedToken);
          
          // Verificar se temos dados válidos do usuário
          let usuarioValido = false;
          if (storedUsuario && storedUsuario !== 'undefined' && storedUsuario !== 'null') {
            try {
              const parsedUsuario = JSON.parse(storedUsuario);
              if (parsedUsuario && typeof parsedUsuario === 'object' && parsedUsuario.nome) {
                setUsuario(parsedUsuario);
                usuarioValido = true;
                console.log('✅ AuthContext: Dados do usuário restaurados com sucesso');
              }
            } catch (error) {
              console.error('❌ AuthContext: Erro ao fazer parse do usuário armazenado:', error);
            }
          }

          // Se tem token mas não tem dados válidos do usuário, buscar do backend
          if (!usuarioValido) {
            console.log('🔄 AuthContext: Token encontrado, mas sem dados do usuário. Buscando do backend...');
            try {
              const userData = await authService.getProfile();
              if (userData) {
                setUsuario(userData);
                localStorage.setItem('usuario', JSON.stringify(userData));
                console.log('✅ AuthContext: Dados do usuário obtidos do backend');
              }
            } catch (error: any) {
              console.error('❌ AuthContext: Erro ao buscar dados do usuário:', error);
              // Se token é inválido (401), limpar tudo
              if (error.response?.status === 401) {
                console.log('🔑 AuthContext: Token inválido, limpando dados...');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                setToken(null);
                setUsuario(null);
              }
            }
          }
        } else {
          console.log('⚠️ AuthContext: Nenhum token encontrado');
          // Limpar dados órfãos
          if (storedUsuario) {
            localStorage.removeItem('usuario');
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Erro crítico ao inicializar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (cpf: string, senha: string, codigoVerificacao?: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      
      const response = await authService.login({
        cpf,
        senha,
        codigo_verificacao: codigoVerificacao
      });

      console.log('📊 AuthContext: Resposta recebida:', {
        hasToken: !!response.access_token,
        hasUsuario: !!response.usuario,
        usuarioNome: response.usuario?.nome,
        responseKeys: Object.keys(response)
      });

      if (response.access_token) {
        try {
          setToken(response.access_token);
          
          // Verificar se tem usuário na resposta
          if (response.usuario) {
            setUsuario(response.usuario);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            console.log('✅ AuthContext: Login completo com usuário');
          } else {
            console.warn('⚠️ AuthContext: Token válido, mas sem dados de usuário');
            // Buscar dados do usuário separadamente se necessário
            // Por enquanto, continuar sem dados do usuário
            setUsuario(null);
            localStorage.removeItem('usuario');
          }
          
          localStorage.setItem('token', response.access_token);
          console.log('✅ AuthContext: Login bem-sucedido e dados salvos');
          return { success: true };
        } catch (storageError) {
          console.error('❌ Erro ao salvar no localStorage:', storageError);
          return { success: false, error: 'Erro ao salvar dados de login' };
        }
      }

      // Verificar se precisa de verificação
      if ((response as any).detail && (response as any).detail.includes('Código de verificação enviado')) {
        console.log('📱 AuthContext: Verificação necessária');
        return {
          success: false,
          needsVerification: true,
          message: (response as any).detail
        };
      }

      console.error('❌ AuthContext: Resposta inválida:', response);
      return { success: false, error: 'Resposta inválida do servidor' };
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error);
      
      if (error.response?.status === 202) {
        console.log('📱 AuthContext: Status 202 - Verificação necessária');
        return {
          success: false,
          needsVerification: true,
          message: error.response.data?.detail || 'Código de verificação enviado'
        };
      }
      
      // Re-throw o erro para ser tratado no componente
      throw error;
    }
  };

  const revalidateUser = async () => {
    try {
      if (!token) {
        console.log('🔍 revalidateUser: Sem token, saindo...');
        return;
      }
      
      console.log('🔄 revalidateUser: Buscando dados atualizados do usuário...');
      
      try {
        const userData = await authService.getProfile();
        if (userData) {
          setUsuario(userData);
          localStorage.setItem('usuario', JSON.stringify(userData));
          console.log('✅ revalidateUser: Dados do usuário atualizados');
        }
      } catch (error: any) {
        console.error('❌ revalidateUser: Erro ao buscar dados do usuário:', error);
        
        // Se token é inválido, limpar tudo
        if (error.response?.status === 401) {
          console.log('🔑 revalidateUser: Token inválido, fazendo logout...');
          logout();
          return;
        }
        
        // Para outros erros, tentar dados do localStorage como fallback
        const storedUsuario = localStorage.getItem('usuario');
        if (storedUsuario && storedUsuario !== 'undefined' && storedUsuario !== 'null') {
          try {
            const parsedUsuario = JSON.parse(storedUsuario);
            if (parsedUsuario && typeof parsedUsuario === 'object' && parsedUsuario.nome) {
              setUsuario(parsedUsuario);
              console.log('⚠️ revalidateUser: Usando dados do localStorage como fallback');
            } else {
              setUsuario(null);
            }
          } catch (parseError) {
            console.error('❌ revalidateUser: Erro ao fazer parse do fallback:', parseError);
            setUsuario(null);
          }
        }
      }
    } catch (error) {
      console.error('❌ revalidateUser: Erro crítico:', error);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUsuario(null);
  };

  const value = {
    usuario,
    token,
    login,
    logout,
    revalidateUser,
    loading,
    isAuthenticated: !!token // Autenticado se tem token, usuário é opcional
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
