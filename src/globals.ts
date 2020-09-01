import { LoxFunction } from "./Callable"

export const globals: Record<string, LoxFunction> = {
    'clock': new LoxFunction(() => Date.now(), () => 0),
}

Object.values(globals).forEach(global => global.toString = () => '<native fn>')
