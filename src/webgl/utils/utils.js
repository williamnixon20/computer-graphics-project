function createProgram(
    gl, shaders) {

    const program = gl.createProgram();
    shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
    });
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        console.log('Error in program linking:' + lastError);

        gl.deleteProgram(program);
        return null;
    }
    return program;
}


function createUniformSetters(gl, program) {

    function createUniformSetter(program, uniformInfo) {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        const typeFunctionMap = {
            [gl.FLOAT]: isArray ? v => gl.uniform1fv(location, v) : v => gl.uniform1f(location, v),
            [gl.FLOAT_VEC2]: v => gl.uniform2fv(location, v),
            [gl.FLOAT_VEC3]: v => gl.uniform3fv(location, v),
            [gl.FLOAT_VEC4]: v => gl.uniform4fv(location, v),
            [gl.INT]: isArray ? v => gl.uniform1iv(location, v) : v => gl.uniform1i(location, v),
            [gl.INT_VEC2]: v => gl.uniform2iv(location, v),
            [gl.INT_VEC3]: v => gl.uniform3iv(location, v),
            [gl.INT_VEC4]: v => gl.uniform4iv(location, v),
            [gl.BOOL]: v => gl.uniform1iv(location, v),
            [gl.BOOL_VEC2]: v => gl.uniform2iv(location, v),
            [gl.BOOL_VEC3]: v => gl.uniform3iv(location, v),
            [gl.BOOL_VEC4]: v => gl.uniform4iv(location, v),
            [gl.FLOAT_MAT2]: v => gl.uniformMatrix2fv(location, false, v),
            [gl.FLOAT_MAT3]: v => gl.uniformMatrix3fv(location, false, v),
            [gl.FLOAT_MAT4]: v => gl.uniformMatrix4fv(location, false, v)
        };

        return typeFunctionMap[type] || null;
    }

    const uniformSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let ii = 0; ii < numUniforms; ++ii) {
        const uniformInfo = gl.getActiveUniform(program, ii);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}


export function setUniforms(setters, ...values) {
    setters = setters.uniformSetters || setters;
    for (const uniforms of values) {
        Object.keys(uniforms).forEach(function (name) {
            const setter = setters[name];
            if (setter) {
                setter(uniforms[name]);
            }
        });
    }
}


function createAttributeSetters(gl, program) {
    const attribSetters = {
    };

    function createAttribSetter(index) {
        return function (b) {
            if (b.value) {
                gl.disableVertexAttribArray(index);
                switch (b.value.length) {
                    case 4:
                        gl.vertexAttrib4fv(index, b.value);
                        break;
                    case 3:
                        gl.vertexAttrib3fv(index, b.value);
                        break;
                    case 2:
                        gl.vertexAttrib2fv(index, b.value);
                        break;
                    case 1:
                        gl.vertexAttrib1fv(index, b.value);
                        break;
                    default:
                        throw new Error('the length of a float constant value must be between 1 and 4!');
                }
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(
                    index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
            }
        };
    }

    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let ii = 0; ii < numAttribs; ++ii) {
        const attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
}


function setAttributes(setters, attribs) {
    setters = setters.attribSetters || setters;
    Object.keys(attribs).forEach(function (name) {
        const setter = setters[name];
        if (setter) {
            setter(attribs[name]);
        }
    });
}

export function createProgramInfo(
    gl, shaderSources) {
    const program = createProgram(gl, shaderSources);
    if (!program) {
        return null;
    }
    const uniformSetters = createUniformSetters(gl, program);
    const attribSetters = createAttributeSetters(gl, program);
    return {
        program: program,
        uniformSetters: uniformSetters,
        attribSetters: attribSetters,
    };
}

export function setBuffersAndAttributes(gl, setters, buffers) {
    setAttributes(setters, buffers.attribs);
    if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
}

function augmentTypedArray(typedArray, numComponents) {
    let cursor = 0;
    typedArray.push = function () {
        for (let ii = 0; ii < arguments.length; ++ii) {
            const value = arguments[ii];
            if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                for (let jj = 0; jj < value.length; ++jj) {
                    typedArray[cursor++] = value[jj];
                }
            } else {
                typedArray[cursor++] = value;
            }
        }
    };
    typedArray.reset = function (opt_index) {
        cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
        get: function () {
            return this.length / this.numComponents | 0;
        },
    });
    return typedArray;
}

export function createAugmentedTypedArray(numComponents, numElements, opt_type) {
    const Type = opt_type || Float32Array;
    return augmentTypedArray(new Type(numComponents * numElements), numComponents);
}

function createBufferFromTypedArray(gl, array, type, drawType) {
    type = type || gl.ARRAY_BUFFER;
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
}

function allButIndices(name) {
    return name !== 'indices';
}

function createMapping(obj) {
    const mapping = {};
    Object.keys(obj).filter(allButIndices).forEach(function (key) {
        mapping['a_' + key] = key;
    });
    return mapping;
}

function getGLTypeForTypedArray(gl, typedArray) {
    if (typedArray instanceof Int8Array) { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array) { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array) { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array) { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array) { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array) { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    throw 'unsupported typed array type';
}

function getNormalizationForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array) { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array) { return true; }  // eslint-disable-line
    return false;
}

function isArrayBuffer(a) {
    return a.buffer && a.buffer instanceof ArrayBuffer;
}


function makeTypedArray(array, name) {
    if (isArrayBuffer(array)) {
        return array;
    }

    if (array.data && isArrayBuffer(array.data)) {
        return array.data;
    }

    if (Array.isArray(array)) {
        array = {
            data: array,
        };
    }

    if (!array.numComponents) {
        array.numComponents = guessNumComponentsFromName(name, array.length);
    }

    let type = array.type;
    if (!type) {
        if (name === 'indices') {
            type = Uint16Array;
        }
    }
    const typedArray = createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
    typedArray.push(array.data);
    return typedArray;
}


function createAttribsFromArrays(gl, arrays, opt_mapping) {
    const mapping = opt_mapping || createMapping(arrays);
    const attribs = {};
    Object.keys(mapping).forEach(function (attribName) {
        const bufferName = mapping[attribName];
        const origArray = arrays[bufferName];
        if (origArray.value) {
            attribs[attribName] = {
                value: origArray.value,
            };
        } else {
            const array = makeTypedArray(origArray, bufferName);
            attribs[attribName] = {
                buffer: createBufferFromTypedArray(gl, array),
                numComponents: origArray.numComponents || array.numComponents || guessNumComponentsFromName(bufferName),
                type: getGLTypeForTypedArray(gl, array),
                normalize: getNormalizationForTypedArray(array),
            };
        }
    });
    return attribs;
}

function getArray(array) {
    return array.length ? array : array.data;
}

const texcoordRE = /coord|texture/i;
const colorRE = /color|colour/i;

function guessNumComponentsFromName(name, length) {
    let numComponents;
    if (texcoordRE.test(name)) {
        numComponents = 2;
    } else if (colorRE.test(name)) {
        numComponents = 4;
    } else {
        numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
        throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length} values is not evenly divisible by ${numComponents}. You should specify it.`);
    }

    return numComponents;
}

function getNumComponents(array, arrayName) {
    return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
}


const positionKeys = ['position', 'positions', 'a_position'];
function getNumElementsFromNonIndexedArrays(arrays) {
    let key;
    for (const k of positionKeys) {
        if (k in arrays) {
            key = k;
            break;
        }
    }
    key = key || Object.keys(arrays)[0];
    const array = arrays[key];
    const length = getArray(array).length;
    const numComponents = getNumComponents(array, key);
    const numElements = length / numComponents;
    if (length % numComponents > 0) {
        throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
    }
    return numElements;
}


export function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
    const bufferInfo = {
        attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
    };
    let indices = arrays.indices;
    if (indices) {
        indices = makeTypedArray(indices, 'indices');
        bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
        bufferInfo.numElements = indices.length;
    } else {
        bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
    }

    return bufferInfo;
}

export function drawBufferInfo(gl, bufferInfo, primitiveType, count, offset) {
    const indices = bufferInfo.indices;
    primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
    const numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? 0 : offset;
    if (indices) {
        gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
    } else {
        gl.drawArrays(primitiveType, offset, numElements);
    }
}

const CUBE_FACE_INDICES = [
    [3, 7, 5, 1], // right
    [6, 2, 0, 4], // left
    [6, 7, 3, 2], // ??
    [0, 1, 5, 4], // ??
    [7, 6, 4, 5], // front
    [2, 3, 1, 0], // back
];

export function createCubeVertices(size) {
    const k = size / 2;

    const cornerVertices = [
        [-k, -k, -k],
        [+k, -k, -k],
        [-k, +k, -k],
        [+k, +k, -k],
        [-k, -k, +k],
        [+k, -k, +k],
        [-k, +k, +k],
        [+k, +k, +k],
    ];

    const faceNormals = [
        [+1, +0, +0],
        [-1, +0, +0],
        [+0, +1, +0],
        [+0, -1, +0],
        [+0, +0, +1],
        [+0, +0, -1],
    ];

    const uvCoords = [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
    ];

    const numVertices = 6 * 4;
    const positions = createAugmentedTypedArray(3, numVertices);
    const normals = createAugmentedTypedArray(3, numVertices);
    const texCoords = createAugmentedTypedArray(2, numVertices);
    const indices = createAugmentedTypedArray(3, 6 * 2, Uint16Array);
    const tangents = createAugmentedTypedArray(3, numVertices);
    const bitangents = createAugmentedTypedArray(3, numVertices);

    for (let f = 0; f < 6; ++f) {
        const faceIndices = CUBE_FACE_INDICES[f];
        const positionsForFace = [];
        const uvsForFace = [];

        for (let v = 0; v < 4; ++v) {
            const position = cornerVertices[faceIndices[v]];
            const uv = uvCoords[v];
            positionsForFace.push(position);
            uvsForFace.push(uv);
        }

        const { tangent, bitangent } = calculateTB(positionsForFace, uvsForFace);

        for (let v = 0; v < 4; ++v) {
            const position = cornerVertices[faceIndices[v]];
            const normal = faceNormals[f];
            const uv = uvCoords[v];

            // Each face needs all four vertices because the normals and texture
            // coordinates are not all the same.
            positions.push(position);
            normals.push(normal);
            texCoords.push(uv);
            tangents.push(tangent);
            bitangents.push(bitangent);
        }
        // Two triangles make a square face.
        const offset = 4 * f;
        indices.push(offset + 0, offset + 1, offset + 2);
        indices.push(offset + 0, offset + 2, offset + 3);
    }

    return {
        position: positions,
        normal: normals,
        texcoord: texCoords,
        indices: indices,
        tangent: tangents,
        bitangent: bitangents,
    };
}

export function calculateTB(positions, uvs) {
    const edge1 = subtractVectors(positions[1], positions[0]);
    const edge2 = subtractVectors(positions[2], positions[0]);
    const deltaUV1 = subtractVectors(uvs[1], uvs[0]);
    const deltaUV2 = subtractVectors(uvs[2], uvs[0]);

    const r = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

    const tangent = [
        r * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]),
        r * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]),
        r * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]),
    ];

    const bitangent = [
        r * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]),
        r * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]),
        r * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2]),
    ];

    return {
        tangent: tangent,
        bitangent: bitangent,
    };
}


function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}

export function createSphereVertices(
    radius,
    subdivisionsAxis,
    subdivisionsHeight,
    opt_startLatitudeInRadians,
    opt_endLatitudeInRadians,
    opt_startLongitudeInRadians,
    opt_endLongitudeInRadians) {
    if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
        throw Error('subdivisionAxis and subdivisionHeight must be > 0');
    }

    opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
    opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
    opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
    opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

    const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
    const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

    const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    const positions = createAugmentedTypedArray(3, numVertices);
    const normals = createAugmentedTypedArray(3, numVertices);
    const texCoords = createAugmentedTypedArray(2, numVertices);
    const tangents = createAugmentedTypedArray(3, numVertices);
    const bitangents = createAugmentedTypedArray(3, numVertices);

    for (let y = 0; y <= subdivisionsHeight; y++) {
        for (let x = 0; x <= subdivisionsAxis; x++) {
            const u = x / subdivisionsAxis;
            const v = y / subdivisionsHeight;
            const theta = longRange * u + opt_startLongitudeInRadians;
            const phi = latRange * v + opt_startLatitudeInRadians;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            const ux = cosTheta * sinPhi;
            const uy = cosPhi;
            const uz = sinTheta * sinPhi;
            positions.push(radius * ux, radius * uy, radius * uz);
            normals.push(ux, uy, uz);
            texCoords.push(1 - u, v);
        }
    }

    const numVertsAround = subdivisionsAxis + 1;
    const indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
    for (let x = 0; x < subdivisionsAxis; x++) {
        for (let y = 0; y < subdivisionsHeight; y++) {

            indices.push(
                (y + 0) * numVertsAround + x,
                (y + 0) * numVertsAround + x + 1,
                (y + 1) * numVertsAround + x);

            indices.push(
                (y + 1) * numVertsAround + x,
                (y + 0) * numVertsAround + x + 1,
                (y + 1) * numVertsAround + x + 1);
        }
    }

    for (let x = 0; x < subdivisionsAxis; x++) {
        for (let y = 0; y < subdivisionsHeight; y++) {
            const index0 = (y + 0) * numVertsAround + x;
            const index1 = (y + 0) * numVertsAround + x + 1;
            const index2 = (y + 1) * numVertsAround + x;

            const p0 = positions.slice(index0 * 3, index0 * 3 + 3);
            const p1 = positions.slice(index1 * 3, index1 * 3 + 3);
            const p2 = positions.slice(index2 * 3, index2 * 3 + 3);

            const uv0 = texCoords.slice(index0 * 2, index0 * 2 + 2);
            const uv1 = texCoords.slice(index1 * 2, index1 * 2 + 2);
            const uv2 = texCoords.slice(index2 * 2, index2 * 2 + 2);

            const { tangent, bitangent } = calculateTB([p0, p1, p2], [uv0, uv1, uv2]);

            tangents.push(tangent);
            bitangents.push(bitangent);
        }
    }

    return {
        position: positions,
        normal: normals,
        texcoord: texCoords,
        indices: indices,
        tangent: tangents,
        bitangent: bitangents,
    };
}


export function calculateTBHollow(nodeDescription, rescaledPositions, textureArr) {
    let tangents = [];
    let bitangents = [];
    for (let i = 0; i < nodeDescription.normals.length; i += 3) {

        let v0 = rescaledPositions.slice(i * 3, i * 3 + 3);
        let v1 = rescaledPositions.slice(i * 3 + 3, i * 3 + 6);
        let v2 = rescaledPositions.slice(i * 3 + 6, i * 3 + 9);

        let uv0 = textureArr.slice(i * 2, i * 2 + 2);
        let uv1 = textureArr.slice(i * 2 + 2, i * 2 + 4);
        let uv2 = textureArr.slice(i * 2 + 4, i * 2 + 6);

        let deltaPos1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        let deltaPos2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

        let deltaUV1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]];
        let deltaUV2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]];

        let r = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
        let tangent = [
            (deltaPos1[0] * deltaUV2[1] - deltaPos2[0] * deltaUV1[1]) * r,
            (deltaPos1[1] * deltaUV2[1] - deltaPos2[1] * deltaUV1[1]) * r,
            (deltaPos1[2] * deltaUV2[1] - deltaPos2[2] * deltaUV1[1]) * r
        ];
        let bitangent = [
            (deltaPos2[0] * deltaUV1[0] - deltaPos1[0] * deltaUV2[0]) * r,
            (deltaPos2[1] * deltaUV1[0] - deltaPos1[1] * deltaUV2[0]) * r,
            (deltaPos2[2] * deltaUV1[0] - deltaPos1[2] * deltaUV2[0]) * r
        ];

        for (let j = 0; j < 3; j++) {
            tangents.push(...tangent);
            bitangents.push(...bitangent);
        }
    }

    return {
        tangent: new Float32Array(tangents),
        bitangent: new Float32Array(bitangents)
    };
}
