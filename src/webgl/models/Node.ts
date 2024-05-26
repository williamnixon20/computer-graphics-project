import { ArticulatedDescriptions, CameraInformation, HollowDescriptions, Transforms, ShadingInfo, TextureType } from '@/app/type';
import m4 from '../utils/m4';
import TRS from '../utils/trs';
import * as utils from "../utils/utils";
import { degToRad } from '../utils/radians';

var id_global = 1;

var url_offset: { [index: string]: number } = {};

var tex_offset = 0;

var light_dir = [1, 1, 1];
export class Node {
    position: number[];
    normal: number[];
    children: Node[];
    localMatrix: number[];
    worldMatrix: number[];
    source: TRS;
    parent: Node | null;
    draw: boolean;
    drawInfo: any;
    cubeBufferInfo: any;
    name: string;
    arrayInfo: {
        [index: string]: ArrayBuffer | number[];
    };
    id: number;
    cameraInformation: CameraInformation;
    shadingInfo: ShadingInfo;
    texture_url: string[];
    specular_url: string[];
    normal_url: string[];
    displacement_url: string[];
    displacementScale: number;
    displacementBias: number;
    cameraMatrix: number[];
    type: number;
    cameraPosition: number[];

    constructor() {
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
        this.source = new TRS();
        this.parent = null;
        this.draw = false;
        this.name = "";
        this.position = [];
        this.normal = [];
        this.arrayInfo = {};
        this.id = id_global;
        this.texture_url = [];
        id_global += 1;
        this.cameraInformation = {
            cameraAngleXRadians: 0,
            cameraAngleYRadians: 0,
            fieldOfViewRadians: degToRad(60),
            radius: 10,
            projType: "perspective",
            translateX: 0,
            translateY: 0,
            rotateX: 0,
            rotateY: 0,
            radiusRotate: 10,
        };
        this.shadingInfo = {
            mode: 0,
            shininess: 200,
            ambientColor: [1, 1, 1],
            specularColor: [1, 1, 1],
            diffuseColor: [1, 1, 1],
            material: 0,
        }
        this.specular_url = [];
        this.normal_url = [];
        this.displacement_url = [];
        this.displacementScale = 0.1;
        this.displacementBias = 0;
        this.cameraMatrix = [];
        this.type = 0;
        this.cameraPosition = [];
    }

    setParent(parent: Node | null) {
        // remove us from our parent
        if (this.parent) {
            const ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
                this.parent.children.splice(ndx, 1);
            }
        }

        // Add us to our new parent
        if (parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    updateWorldMatrix(parentWorldMatrix: number[] | null) {
        const source = this.source;
        if (source) {
            source.getMatrix(this.localMatrix);
        }

        if (parentWorldMatrix) {
            m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
        } else {
            m4.copy(this.localMatrix, this.worldMatrix);
        }

        // now process all the children
        const worldMatrix = this.worldMatrix;
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        });
    }

    updateCameraInformation(cameraInformation: CameraInformation) {
        this.cameraInformation = cameraInformation;
        this.children.forEach((child) => {
            child.updateCameraInformation(cameraInformation);
        });
    }

    updateCameraMatrix(cameraMatrix: number[]) {
        this.cameraMatrix = cameraMatrix;
        this.children.forEach((child) => {
            child.updateCameraMatrix(cameraMatrix);
        });
    }

    updateCameraPosition(cameraPosition: number[]) {
        this.cameraPosition = cameraPosition;
        this.children.forEach((child) => {
            child.updateCameraPosition(cameraPosition);
        });
    }

    buildArticulated(nodeDescription: ArticulatedDescriptions) {
        let trs = this.source
        trs.translation = nodeDescription.translation || trs.translation;
        trs.rotation = nodeDescription.rotation || trs.rotation;
        trs.scale = nodeDescription.scale || trs.scale;

        this.name = nodeDescription.name;

        this.draw = nodeDescription.draw !== false;

        let vertices;
        if (nodeDescription?.prim === "sphere") {
            this.type = 1;
            console.log("TYPE ", this.type);
            vertices = utils.createSphereVertices(1, 20, 20);
        } else {
            vertices = utils.createCubeVertices(1);
        }
        this.arrayInfo = vertices;


        let childrenNodes = this.makeNodes(nodeDescription.children, "articulated")


        // set parent to this for every childrenNodes
        for (let i = 0; i < childrenNodes.length; i++) {
            if (childrenNodes[i] instanceof Node) {
                childrenNodes[i].setParent(this);
            }
        }
        return this;
    }

    buildHollow(nodeDescription: HollowDescriptions) {
        this.draw = true;
        const lengthPoint = nodeDescription.positions.length / (3 * 6);
        let textureArrBase = [
            1, 0,
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
        ];

        let rescaledPositions = nodeDescription.positions.map((pos) => pos * 0.03);

        let textureArr: number[] = [];
        for (let i = 0; i < lengthPoint; i++) {
            textureArr = textureArr.concat(textureArrBase);
        }

        const tangentsAndBitangents  = utils.calculateTBHollow(nodeDescription, rescaledPositions, textureArr);
    
        this.arrayInfo = {
            position: rescaledPositions,
            normal: nodeDescription.normals,
            texcoord: new Float32Array(textureArr),
            tangent: tangentsAndBitangents.tangent,
            bitangent: tangentsAndBitangents.bitangent,
        }
        console.log("ARRAY INFO", this.arrayInfo)
        this.name = nodeDescription.name;
        return this;
    }
    
    buildByDescription(nodeDescription: ArticulatedDescriptions | HollowDescriptions) {
        if (nodeDescription.type === "articulated") {
            return this.buildArticulated(nodeDescription as ArticulatedDescriptions);
        } else if (nodeDescription.type === "saved") {
            return this.fromJSON(nodeDescription as any);
        } else {
            return this.buildHollow(nodeDescription as HollowDescriptions);
        }
    }

    fromJSON(json: any) {
        let trs = this.source
        trs.translation = json.translation || trs.translation;
        trs.rotation = json.rotation || trs.rotation;
        trs.scale = json.scale || trs.scale;

        this.name = json.name;
        this.draw = json.draw !== false;
        this.arrayInfo = json.arrayInfo;
        this.cameraInformation = json.cameraInformation;
        this.shadingInfo = json.shadingInfo;

        this.texture_url = json.texture_url;
        this.specular_url = json.specular_url;
        this.normal_url = json.normal_url;
        this.displacement_url = json.displacement_url;
        this.displacementScale = json.displacementScale;
        this.displacementBias = json.displacementBias;

        let childrenNodes = this.makeNodes(json.children, "saved")

        // set parent to this for every childrenNodes
        for (let i = 0; i < childrenNodes.length; i++) {
            if (childrenNodes[i] instanceof Node) {
                childrenNodes[i].setParent(this);
            }
        }
        return this;
    }


    makeNodes(nodeDescriptions: ArticulatedDescriptions[] | HollowDescriptions[] | undefined, type: string) {
        return nodeDescriptions ? nodeDescriptions.map((node) => {
            node["type"] = type;
            const childNode = new Node();
            return childNode.buildByDescription(node)
        }) : [];
    }

    async drawNode(gl: WebGLRenderingContext, viewProjectionMatrix: number[], programInfo: any, enableTexture: boolean = true) {
        if (this.draw) {
            // set shader uniforms
            let uniforms = {
                u_id: [
                    ((this.id >> 0) & 0xFF) / 0xFF,
                    ((this.id >> 8) & 0xFF) / 0xFF,
                    ((this.id >> 16) & 0xFF) / 0xFF,
                    ((this.id >> 24) & 0xFF) / 0xFF,
                ],

                u_color: this.shadingInfo.ambientColor,
                u_reverseLightDirection: light_dir,
                u_worldViewProjection: [],
                u_worldInverseTranspose: [],
                u_world: [],
                displacementMap: (this.shadingInfo.displacementMap && enableTexture) ? this.shadingInfo.displacementMap : 0,
                u_displacementScale: this.displacementScale,
                u_displacementBias: this.displacementBias,

                type: this.type,
                u_cameraPosition: this.cameraPosition,
                u_diffuseColor: this.shadingInfo.diffuseColor,
                u_shininess: this.shadingInfo.shininess,
                u_specularColor: this.shadingInfo.specularColor,
                mode: this.shadingInfo.mode,
                material: (this.shadingInfo.material && enableTexture) ? this.shadingInfo.material : 0,
                specularMap: (this.shadingInfo.specularMap && enableTexture) ? this.shadingInfo.specularMap : 0,
                normalMap: (this.shadingInfo.normalMap && enableTexture) ? this.shadingInfo.normalMap : 0,
            }
            const u_world = m4.inverse(this.cameraMatrix);

            uniforms.u_world = u_world;
            uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, this.worldMatrix);
            uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(u_world));

            gl.useProgram(programInfo.program);
            utils.setUniforms(programInfo, uniforms);

            let bufferInfo = utils.createBufferInfoFromArrays(gl, this.arrayInfo);


            utils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            if (uniforms.material > 0 && this.texture_url[uniforms.material]) {
                // console.log(uniforms.material)
                // console.log(this.texture_url[uniforms.material]);
                const tex_offset = url_offset[this.texture_url[uniforms.material]];
                // console.log("TEXTURE OFFSET", tex_offset)
                gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_texture"), 2 + tex_offset);
            }

            if (uniforms.specularMap > 0) {
                const tex_offset = url_offset[this.specular_url[uniforms.specularMap]];
                gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_specularMap"), 2 + tex_offset);
            }
            // console.log("NORMAL MAP", this.shadingInfo.normalMap, uniforms.normalMap)

            if (uniforms.normalMap > 0) {
                const tex_offset = url_offset[this.normal_url[uniforms.normalMap]];
                gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_normalMap"), 2 + tex_offset);
            }

            if (uniforms.displacementMap > 0) {
                // console.log("DISPLACEMENT MAP", this.displacement_url, uniforms.displacementMap)
                const tex_offset = url_offset[this.displacement_url[uniforms.displacementMap]];
                gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_displacementMap"), 2 + tex_offset);
            }

            utils.drawBufferInfo(gl, bufferInfo);
        } else {
            // console.log("NOT DRAWING!")
        }

        this.children.forEach((child) => {
            child.drawNode(gl, viewProjectionMatrix, programInfo, enableTexture);
        })
    }

    getCurrentMatrix() {
        const source = this.source;
        if (source) {
            source.getMatrix(this.localMatrix);
        }

        m4.copy(this.localMatrix, this.worldMatrix);
        return this.worldMatrix;
    }

    procedureGetNodeRefDict(nodeDict: any, level = 0) {
        nodeDict[this.name] = {
            "node": this,
            "level": level,
            "id": this.id
        }
        this.children.forEach((child) => {
            child.procedureGetNodeRefDict(nodeDict, level + 1);
        })
    }

    addTransform(transform: Transforms) {
        this.source.setDelta(transform);
    }

    setTransform(transform: Transforms) {
        this.source.setTransform(transform);
    }

    getById(id: number): Node | null {
        if (this.id === id) {
            return this;
        }
        for (let i = 0; i < this.children.length; i++) {
            let node = this.children[i].getById(id);
            if (node) {
                return node;
            }
        }
        return null;
    }

    setShadingMode(shadingMode: number) {
        this.shadingInfo.mode = shadingMode;
        this.children.forEach((child) => {
            child.setShadingMode(shadingMode);
        })
    }

    setAmbientColor(ambientColor: number[]) {
        this.shadingInfo.ambientColor = ambientColor;
        this.children.forEach((child) => {
            child.setAmbientColor(ambientColor);
        })
    }

    setDiffuseColor(diffuseColor: number[]) {
        this.shadingInfo.diffuseColor = diffuseColor;
        this.children.forEach((child) => {
            child.setDiffuseColor(diffuseColor);
        })
    }

    setShininess(shininess: number) {
        this.shadingInfo.shininess = shininess;
        this.children.forEach((child) => {
            child.setShininess(shininess);
        })
    }

    setSpecularColor(specularColor: number[]) {
        this.shadingInfo.specularColor = specularColor;
        this.children.forEach((child) => {
            child.setSpecularColor(specularColor);
        })
    }

    setUsedTextures(id: number, type: TextureType) {
        if (type === TextureType.NORMAL) {
            this.shadingInfo.normalMap = id;
        } else if (type === TextureType.SPECULAR) {
            this.shadingInfo.specularMap = id;
        } else if (type === TextureType.DISPLACEMENT) {
            this.shadingInfo.displacementMap = id;
        } else {
            this.shadingInfo.material = id;
        }

        this.children.forEach((child) => {
            child.setUsedTextures(id, type);
        })
    }

    setTexture(gl: any, url: any, id: number, type: TextureType) {

        this.loadTexture(gl, url);

        if (type === TextureType.NORMAL) {
            this.normal_url[id] = url;
        } else if (type === TextureType.SPECULAR) {
            this.specular_url[id] = url;
        } else if (type === TextureType.DISPLACEMENT) {
            this.displacement_url[id] = url;
        } else {
            this.texture_url[id] = url;
        }

        this.children.forEach((child) => {
            child.setTexture(gl, url, id, type);
        })
    }

    loadTexture(gl: any, url: any) {
        if (url === "blank") {
            bindTextureBlank(gl);
        } else {
            bindTexture(gl, url);
        }
        return true;
    }

    // LIGHT DIR IS A GLOBAL VAR
    setLightDirection(lightDirection: number[]) {
        light_dir = lightDirection;
    }

    setDisplacementScale(scale: number) {
        this.displacementScale = scale;
        this.children.forEach((child) => {
            child.setDisplacementScale(scale);
        })
    }

    setDisplacementBias(bias: number) {
        this.displacementBias = bias;
        this.children.forEach((child) => {
            child.setDisplacementBias(bias);
        })
    }

    toJsonFormat() {
        // save everything
        let nodeDescription: any = {
            "name": this.name,
            "id": this.id,
            "type": "saved",
            "translation": this.source.getTranslateWDelta(),
            "rotation": this.source.getRotateWDelta(),
            "scale": this.source.getScaleWDelta(),
            "draw": this.draw,
            "arrayInfo": {
                // @ts-ignore
                "position": Array.from(this.arrayInfo.position),
                // @ts-ignore
                "normal": Array.from(this.arrayInfo.normal),
                // @ts-ignore
                "texcoord": Array.from(this.arrayInfo.texcoord),
                // @ts-ignore
                "tangent": Array.from(this.arrayInfo.tangent),
                // @ts-ignore
                "bitangent": Array.from(this.arrayInfo.bitangent),
            },
            "cameraInformation": this.cameraInformation,
            "shadingInfo": this.shadingInfo,
            "texture_url": this.texture_url,
            "specular_url": this.specular_url,
            "normal_url": this.normal_url,
            "displacement_url": this.displacement_url,
            "displacementScale": this.displacementScale,
            "displacementBias": this.displacementBias,

            "children": []
        }

        if (this.arrayInfo.indices) {
            // @ts-ignore
            nodeDescription.arrayInfo.indices = Array.from(this.arrayInfo.indices);
        }

        if (this.arrayInfo.indices) {
            // @ts-ignore
            nodeDescription.arrayInfo.indices = Array.from(this.arrayInfo.indices);
        }

        this.children.forEach((child) => {
            nodeDescription.children.push(child.toJsonFormat());
        })
        console.log("SAVE INFO", nodeDescription.arrayInfo)

        return nodeDescription;
    }
}

function bindTextureBlank(gl: WebGLRenderingContext) {
    const texture = gl.createTexture();
    const url = "blank"
    if (!(url in url_offset)) {
        console.log("URL OFFSET", url_offset, tex_offset)
        url_offset[url] = tex_offset;
        tex_offset += 1;
    }
    gl.activeTexture(gl.TEXTURE2 + url_offset[url]);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // temp texture
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]);
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}

function bindTexture(gl: WebGLRenderingContext, url: string) {
    const image = new Image();
    image.src = url;

    image.onload = () => {
        if (!(url in url_offset)) {
            console.log("URL OFFSET", url_offset, tex_offset)
            url_offset[url] = tex_offset;
            tex_offset += 1;
        }
        gl.activeTexture(gl.TEXTURE2 + url_offset[url]);

        // dont rebind if texture already used
        let boundTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        if (boundTexture) {
            gl.activeTexture(gl.TEXTURE1);
            return;
        }
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // temp texture
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 255, 255, 255]);

        console.log("LOADED", url, url_offset[url])
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.activeTexture(gl.TEXTURE1);
    };
}