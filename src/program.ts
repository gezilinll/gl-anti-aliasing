export class Program {
    private _vertexShader: WebGLShader | null;
    private _fragmentShader: WebGLShader | null;
    glHandle: WebGLProgram | null;
    private _uniformLocations = new Map<string, WebGLUniformLocation>();
    private _attribLocations: { [name: string]: number } = {};

    constructor(vertexShaderSource: string,
        fragmentShaderSource: string,
        private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._vertexShader = this._createShader(this._gl.VERTEX_SHADER, vertexShaderSource);
        this._fragmentShader = this._createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.glHandle = this._createProgram();
    }

    private _createShader(type: number, source: string): WebGLShader {
        const gl = this._gl;
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader');
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }

    private _createProgram(): WebGLProgram {
        const gl = this._gl;
        const program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create program');
        }
        gl.attachShader(program, this._vertexShader!);
        gl.attachShader(program, this._fragmentShader!);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`Failed to link program: ${gl.getProgramInfoLog(program)}`);
        }

        // 缓存 uniform 变量位置
        for (let i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < len; ++i) {
            const info = gl.getActiveUniform(program, i);

            if (info == null) {
                continue;
            }

            const location = gl.getUniformLocation(program, info.name);
            if (!location) {
                continue;
            }
            this._uniformLocations.set(info.name, location);
        }

        return program;
    }

    getAttribLocation(name: string): number {
        if (name in this._attribLocations) {
            return this._attribLocations[name];
        }
        const gl = this._gl;

        const location = gl.getAttribLocation(this.glHandle!, name);
        if (location === -1) {
            throw new Error(`Failed to get attribute location for ${name}`);
        }
        this._attribLocations[name] = location;

        return location;
    }

    getUniformLocation(name: string): WebGLUniformLocation | null {
        if (!this._uniformLocations.has(name)) {
            return null;
        }

        return this._uniformLocations.get(name)!;
    }

    public setUniform(
        name: string | number,
        value: number | Float32List | Int32List | Uint32List | boolean,
    ): void {
        const gl = this._gl;
        const location = typeof name === 'number' ? name : this._uniformLocations.get(name);
        if (location === undefined) {
            console.error(`Failed to get uniform location for ${name}`);
            return;
        }
        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                gl.uniform1i(location, value);
            } else {
                gl.uniform1f(location, value);
            }
        } else if (typeof value === 'boolean') {
        } else if (value instanceof Float32Array || Array.isArray(value)) {
            const length = value.length;
            switch (length) {
                case 1:
                    gl.uniform1fv(location, value);
                    break;
                case 2:
                    gl.uniform2fv(location, value);
                    break;
                case 3:
                    gl.uniform3fv(location, value);
                    break;
                case 4:
                    gl.uniform4fv(location, value);
                    break;
                case 9:
                    gl.uniformMatrix3fv(location, false, value);
                    break;
                case 16:
                    gl.uniformMatrix4fv(location, false, value);
                    break;
                default:
                    throw new Error('Unsupported uniform value');
            }
        } else if (value instanceof Int32Array || value instanceof Uint32Array) {
            const length = value.length;
            switch (length) {
                case 1:
                    gl.uniform1iv(location, value);
                    break;
                case 2:
                    gl.uniform2iv(location, value);
                    break;
                case 3:
                    gl.uniform3iv(location, value);
                    break;
                case 4:
                    gl.uniform4iv(location, value);
                    break;
                default:
                    throw new Error('Unsupported uniform value');
            }
        } else {
            throw new TypeError('Unsupported uniform value');
        }
    }

    destroy() {
        const gl = this._gl;

        gl.deleteProgram(this.glHandle);
        gl.deleteShader(this._vertexShader);
        gl.deleteShader(this._fragmentShader);

        this.glHandle = null;
        this._vertexShader = null;
        this._fragmentShader = null;
    }
}