/**
 * @name FlowSure
 * @version 0.9.6
 * @author Esther Brunner
 */
import { of, isMaybe } from './lib/maybe'
import { of as result, from, fromAsync, isResult, unwrap } from './lib/result'

const Maybe = { of, isMaybe }
const Result = { of: result, from, fromAsync, isResult, unwrap }

export { Ok } from './lib/ok'
export { Nil } from './lib/nil'
export { Err } from './lib/err'
export { Maybe, Result }
export { flow } from './lib/flow'
