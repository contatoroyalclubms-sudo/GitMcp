'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cashlessAPI } from '@/lib/api';
import { CreditCard, Plus, Minus, History, DollarSign } from 'lucide-react';

interface Transaction {
  transaction_id: number;
  user_id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  timestamp: string;
}

interface Balance {
  user_id: number;
  balance: number;
  currency: string;
  last_transaction: string;
}

export default function CashlessPage() {
  const { user, hasPermission } = useAuth();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBalance();
    }
  }, [user]);

  const loadBalance = async () => {
    if (!user) return;
    
    try {
      const response = await cashlessAPI.getBalance(user.id);
      setBalance(response.data);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTransaction = async () => {
    if (!user || !transactionAmount || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const amount = parseFloat(transactionAmount);
      const finalAmount = transactionType === 'debit' ? -amount : amount;
      
      const response = await cashlessAPI.createTransaction({
        user_id: user.id,
        amount: finalAmount,
        type: transactionType,
        description: transactionDescription || `${transactionType === 'credit' ? 'Crédito' : 'Débito'} de R$ ${amount.toFixed(2)}`
      });
      
      const newTransaction = response.data;
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (balance) {
        setBalance({
          ...balance,
          balance: balance.balance + finalAmount,
          last_transaction: newTransaction.timestamp
        });
      }
      
      setTransactionAmount('');
      setTransactionDescription('');
      
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar o sistema cashless.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            Sistema Cashless
          </h1>
          <p className="text-gray-600 mt-2">Gerencie seu saldo e transações</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Saldo Atual</p>
              <p className="text-3xl font-bold">
                {balance ? `R$ ${balance.balance.toFixed(2)}` : 'R$ 0,00'}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                Última transação: {balance?.last_transaction ? new Date(balance.last_transaction).toLocaleString('pt-BR') : 'Nenhuma'}
              </p>
            </div>
            <DollarSign className="h-16 w-16 text-blue-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Form */}
          {hasPermission('cashless.update') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Nova Transação
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Transação
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTransactionType('credit')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        transactionType === 'credit'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Crédito
                    </button>
                    <button
                      onClick={() => setTransactionType('debit')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        transactionType === 'debit'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:border-red-300'
                      }`}
                    >
                      <Minus className="h-4 w-4 inline mr-2" />
                      Débito
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição da transação"
                  />
                </div>

                <button
                  onClick={processTransaction}
                  disabled={!transactionAmount || isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    transactionType === 'credit'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? 'Processando...' : `Processar ${transactionType === 'credit' ? 'Crédito' : 'Débito'}`}
                </button>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Histórico de Transações
            </h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.transaction_id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.amount > 0 ? (
                          <Plus className="h-4 w-4 text-green-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
