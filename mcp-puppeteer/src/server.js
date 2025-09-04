#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import winston from 'winston';

// Configure Puppeteer with plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'mcp-puppeteer.log' }),
    new winston.transports.Console()
  ]
});

class PuppeteerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "mcp-puppeteer",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.browser = null;
    this.page = null;
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "launch_browser",
            description: "Launch a new browser instance with configurable options",
            inputSchema: {
              type: "object",
              properties: {
                headless: {
                  type: "boolean",
                  description: "Run browser in headless mode",
                  default: true
                },
                viewport: {
                  type: "object",
                  properties: {
                    width: { type: "number", default: 1920 },
                    height: { type: "number", default: 1080 }
                  }
                },
                userAgent: {
                  type: "string",
                  description: "Custom user agent string"
                }
              }
            }
          },
          {
            name: "navigate_to",
            description: "Navigate to a specific URL",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to navigate to"
                },
                waitUntil: {
                  type: "string",
                  enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
                  default: "load"
                }
              },
              required: ["url"]
            }
          },
          {
            name: "click_element",
            description: "Click on an element using selector",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector for the element to click"
                },
                waitForSelector: {
                  type: "boolean",
                  description: "Wait for selector to be visible before clicking",
                  default: true
                }
              },
              required: ["selector"]
            }
          },
          {
            name: "type_text",
            description: "Type text into an input field",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector for the input field"
                },
                text: {
                  type: "string",
                  description: "Text to type"
                },
                clear: {
                  type: "boolean",
                  description: "Clear field before typing",
                  default: true
                }
              },
              required: ["selector", "text"]
            }
          },
          {
            name: "get_text",
            description: "Extract text content from an element",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector for the element"
                }
              },
              required: ["selector"]
            }
          },
          {
            name: "take_screenshot",
            description: "Take a screenshot of the current page",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "File path to save screenshot"
                },
                fullPage: {
                  type: "boolean",
                  description: "Capture full page",
                  default: false
                },
                clip: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" }
                  }
                }
              }
            }
          },
          {
            name: "execute_script",
            description: "Execute JavaScript in the page context",
            inputSchema: {
              type: "object",
              properties: {
                script: {
                  type: "string",
                  description: "JavaScript code to execute"
                }
              },
              required: ["script"]
            }
          },
          {
            name: "wait_for_element",
            description: "Wait for an element to appear",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector to wait for"
                },
                timeout: {
                  type: "number",
                  description: "Timeout in milliseconds",
                  default: 30000
                },
                visible: {
                  type: "boolean",
                  description: "Wait for element to be visible",
                  default: true
                }
              },
              required: ["selector"]
            }
          },
          {
            name: "get_page_source",
            description: "Get the HTML source of the current page",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "close_browser",
            description: "Close the browser instance",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "form_fill",
            description: "Fill out a form with multiple fields",
            inputSchema: {
              type: "object",
              properties: {
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      selector: { type: "string" },
                      value: { type: "string" },
                      type: { 
                        type: "string", 
                        enum: ["text", "select", "checkbox", "radio"],
                        default: "text"
                      }
                    },
                    required: ["selector", "value"]
                  }
                }
              },
              required: ["fields"]
            }
          },
          {
            name: "scroll_page",
            description: "Scroll the page",
            inputSchema: {
              type: "object",
              properties: {
                direction: {
                  type: "string",
                  enum: ["up", "down", "top", "bottom"],
                  default: "down"
                },
                distance: {
                  type: "number",
                  description: "Pixels to scroll (for up/down)"
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "launch_browser":
            return await this.launchBrowser(args);
          case "navigate_to":
            return await this.navigateTo(args);
          case "click_element":
            return await this.clickElement(args);
          case "type_text":
            return await this.typeText(args);
          case "get_text":
            return await this.getText(args);
          case "take_screenshot":
            return await this.takeScreenshot(args);
          case "execute_script":
            return await this.executeScript(args);
          case "wait_for_element":
            return await this.waitForElement(args);
          case "get_page_source":
            return await this.getPageSource(args);
          case "close_browser":
            return await this.closeBrowser(args);
          case "form_fill":
            return await this.formFill(args);
          case "scroll_page":
            return await this.scrollPage(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error(`Error executing tool ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async launchBrowser(args = {}) {
    try {
      const options = {
        headless: args.headless !== false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };

      if (args.userAgent) {
        options.args.push(`--user-agent=${args.userAgent}`);
      }

      this.browser = await puppeteer.launch(options);
      this.page = await this.browser.newPage();

      if (args.viewport) {
        await this.page.setViewport(args.viewport);
      } else {
        await this.page.setViewport({ width: 1920, height: 1080 });
      }

      logger.info('Browser launched successfully');
      return {
        content: [
          {
            type: "text",
            text: "Browser launched successfully"
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to launch browser:', error);
      throw error;
    }
  }

  async navigateTo(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      await this.page.goto(args.url, { 
        waitUntil: args.waitUntil || 'load',
        timeout: 30000
      });

      logger.info(`Navigated to: ${args.url}`);
      return {
        content: [
          {
            type: "text",
            text: `Successfully navigated to: ${args.url}`
          }
        ]
      };
    } catch (error) {
      logger.error(`Failed to navigate to ${args.url}:`, error);
      throw error;
    }
  }

  async clickElement(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      if (args.waitForSelector) {
        await this.page.waitForSelector(args.selector, { timeout: 10000 });
      }

      await this.page.click(args.selector);

      logger.info(`Clicked element: ${args.selector}`);
      return {
        content: [
          {
            type: "text",
            text: `Successfully clicked element: ${args.selector}`
          }
        ]
      };
    } catch (error) {
      logger.error(`Failed to click element ${args.selector}:`, error);
      throw error;
    }
  }

  async typeText(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      if (args.clear) {
        await this.page.focus(args.selector);
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('KeyA');
        await this.page.keyboard.up('Control');
      }

      await this.page.type(args.selector, args.text);

      logger.info(`Typed text into: ${args.selector}`);
      return {
        content: [
          {
            type: "text",
            text: `Successfully typed text into: ${args.selector}`
          }
        ]
      };
    } catch (error) {
      logger.error(`Failed to type text into ${args.selector}:`, error);
      throw error;
    }
  }

  async getText(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      const text = await this.page.$eval(args.selector, element => element.textContent);

      logger.info(`Extracted text from: ${args.selector}`);
      return {
        content: [
          {
            type: "text",
            text: text || "No text found"
          }
        ]
      };
    } catch (error) {
      logger.error(`Failed to get text from ${args.selector}:`, error);
      throw error;
    }
  }

  async takeScreenshot(args = {}) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      const options = {
        fullPage: args.fullPage || false
      };

      if (args.path) {
        options.path = args.path;
      }

      if (args.clip) {
        options.clip = args.clip;
      }

      const screenshot = await this.page.screenshot(options);

      logger.info('Screenshot taken');
      return {
        content: [
          {
            type: "text",
            text: args.path ? `Screenshot saved to: ${args.path}` : "Screenshot taken"
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to take screenshot:', error);
      throw error;
    }
  }

  async executeScript(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      const result = await this.page.evaluate(args.script);

      logger.info('Script executed successfully');
      return {
        content: [
          {
            type: "text",
            text: `Script result: ${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to execute script:', error);
      throw error;
    }
  }

  async waitForElement(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      await this.page.waitForSelector(args.selector, {
        timeout: args.timeout || 30000,
        visible: args.visible !== false
      });

      logger.info(`Element found: ${args.selector}`);
      return {
        content: [
          {
            type: "text",
            text: `Element found: ${args.selector}`
          }
        ]
      };
    } catch (error) {
      logger.error(`Failed to wait for element ${args.selector}:`, error);
      throw error;
    }
  }

  async getPageSource() {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      const html = await this.page.content();

      logger.info('Page source retrieved');
      return {
        content: [
          {
            type: "text",
            text: html
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to get page source:', error);
      throw error;
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Browser closed successfully');
      }

      return {
        content: [
          {
            type: "text",
            text: "Browser closed successfully"
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to close browser:', error);
      throw error;
    }
  }

  async formFill(args) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      for (const field of args.fields) {
        switch (field.type) {
          case 'text':
            await this.page.type(field.selector, field.value);
            break;
          case 'select':
            await this.page.select(field.selector, field.value);
            break;
          case 'checkbox':
          case 'radio':
            await this.page.click(field.selector);
            break;
        }
      }

      logger.info('Form filled successfully');
      return {
        content: [
          {
            type: "text",
            text: "Form filled successfully"
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to fill form:', error);
      throw error;
    }
  }

  async scrollPage(args = {}) {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch_browser first.");
    }

    try {
      switch (args.direction) {
        case 'top':
          await this.page.evaluate(() => window.scrollTo(0, 0));
          break;
        case 'bottom':
          await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          break;
        case 'up':
          await this.page.evaluate((distance) => window.scrollBy(0, -(distance || 500)), args.distance);
          break;
        case 'down':
        default:
          await this.page.evaluate((distance) => window.scrollBy(0, distance || 500), args.distance);
          break;
      }

      logger.info(`Scrolled page: ${args.direction}`);
      return {
        content: [
          {
            type: "text",
            text: `Page scrolled: ${args.direction}`
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to scroll page:', error);
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info("MCP Puppeteer server running on stdio");
  }
}

const server = new PuppeteerMCPServer();
server.run().catch(console.error);
