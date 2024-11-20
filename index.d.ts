/**
 * @name FlowSure
 * @version 0.10.0
 * @author Esther Brunner
 */
export { Ok, ok, isOk, isGone } from './lib/ok';
export { Nil, nil, isNil } from './lib/nil';
export { Err, err, isErr } from './lib/err';
export { type Maybe, maybe, isMaybe } from './lib/maybe';
export { isFunction, isAsyncFunction, isDefined, isMutable, isInstanceOf, isError, log, tryClone, } from './lib/util';
export { type Result, type MaybeResult, result, task, flow, isResult, wrap, unwrap, } from './lib/result';
