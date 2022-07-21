import { StackTrace } from "./type"

export abstract class InterpreterError extends Error {
  readonly code: string
  stackTrace: StackTrace | null = null
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

/**
 * シンタックスエラー
 */
export class FlowchartSyntaxError extends InterpreterError {
  readonly type = "SYNTAX_ERROR"
}

/**
 * その他のエラー
 */
export class InternalError extends InterpreterError {
  readonly type = "INTERNAL_ERROR"
}
