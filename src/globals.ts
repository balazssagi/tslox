import { NativeFunction } from "./Callable"

export const globals: Record<string, NativeFunction> = {
    'clock': new NativeFunction(0, () => Date.now()),
}
