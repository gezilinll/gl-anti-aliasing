export class Program {
    private _vertexShader: WebGLShader | null;
    private _fragmentShader: WebGLShader | null;
    private _program: WebGLProgram | null;
    private _uniformLocations = new Map<string, WebGLUniformLocation>();
    private _attribLocations: { [name: string]: number } = {};

    constructor(vertexShaderSource: string,
        fragmentShaderSource: string,
        private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._vertexShader = this._createShader(this._gl.VERTEX_SHADER, vertexShaderSource);
        this._fragmentShader = this._createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource);
        this._program = this._createProgram();
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

        const location = gl.getAttribLocation(this._program!, name);
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

    use(): void {
        const gl = this._gl;
        gl.useProgram(this._program);
    }

    unuse() {
        const gl = this._gl;
        gl.useProgram(null);
    }
}