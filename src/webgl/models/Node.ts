import { ArticulatedDescriptions, CameraInformation, HollowDescriptions, Transforms, ShadingInfo } from '@/app/type';
import m4 from '../utils/m4';
import TRS from '../utils/trs';
import * as utils from "../utils/utils";
import { degToRad } from '../utils/radians';

var id_global = 1;

var url_offset: any = {

}
var tex_offset = 0;

var light_dir = [1, 1, 1];
export class Node {
    position: number[];
    color: number[];
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
    texture: WebGLTexture | null;
    texture_url: string;
    camera1Pos;
    camera2Pos;

    constructor() {
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
        this.source = new TRS();
        this.parent = null;
        this.draw = false;
        this.name = "";
        this.position = [];
        this.color = [0, 0, 0, 255];
        this.normal = [];
        this.arrayInfo = {};
        this.id = id_global;
        this.texture_url = "";
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
            shininess: 100,
            ambientColor: [1, 1, 1],
            specularColor: [1, 1, 1],
            diffuseColor: [1, 1, 1],
            material: 0,
        }
        this.texture = null;
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

    buildArticulated(nodeDescription: ArticulatedDescriptions) {
        let trs = this.source
        trs.translation = nodeDescription.translation || trs.translation;
        trs.rotation = nodeDescription.rotation || trs.rotation;
        trs.scale = nodeDescription.scale || trs.scale;

        this.name = nodeDescription.name;

        this.draw = nodeDescription.draw !== false;


        let cubeVertices = utils.createCubeVertices(1);
        let vertices = utils.deindexVertices(cubeVertices);
        // vertices = primitives.makeColor(vertices, this.shadingInfo.ambientColor);


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
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            1, 1,
        ];

        let textureArr: number[] = [];
        for (let i = 0; i < lengthPoint; i++) {
            textureArr = textureArr.concat(textureArrBase);
        }
        let rescaledPositions = nodeDescription.positions.map((pos) => pos * 0.01);

        this.arrayInfo = {
            position: rescaledPositions,
            normal: nodeDescription.normals,
            texcoord: new Float32Array(textureArr)
        }
        this.name = nodeDescription.name;
        return this;
    }

    buildByDescription(nodeDescription: ArticulatedDescriptions | HollowDescriptions) {
        if (nodeDescription.type === "articulated") {
            return this.buildArticulated(nodeDescription as ArticulatedDescriptions);
        }
        else {
            return this.buildHollow(nodeDescription as HollowDescriptions);
        }
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

                u_diffuseColor: this.shadingInfo.diffuseColor,
                u_shininess: this.shadingInfo.shininess,
                u_specularColor: this.shadingInfo.specularColor,
                mode: this.shadingInfo.mode,
                material: (this.shadingInfo.material && enableTexture) ? 1 : 0,
            }
            const u_world = m4.yRotation(this.cameraInformation.cameraAngleXRadians);

            uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, this.worldMatrix);
            uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(u_world));

            let bufferInfo = utils.createBufferInfoFromArrays(gl, this.arrayInfo);

            gl.useProgram(programInfo.program);

            utils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            utils.setUniforms(programInfo, uniforms);

            if (this.texture && uniforms.material) {
                const tex_offset = url_offset[this.texture_url];
                gl.activeTexture(gl.TEXTURE2 + tex_offset);
                gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_texture"), 2 + tex_offset);
            }

            utils.drawBufferInfo(gl, bufferInfo);
        } else {
            console.log("NOT DRAWING!")
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

    setMaterial(material: number) {
        this.shadingInfo.material = material;
        this.children.forEach((child) => {
            child.setMaterial(material);
        })
    }

    setTexture(gl: any, url: any) {
        this.texture = this.loadTexture(gl, url);
        this.texture_url = url;
        this.children.forEach((child) => {
            child.setTexture(gl, url);
        })
    }

    loadTexture(gl: WebGLRenderingContext, url: string) {
        if (!(url in url_offset)) {
            console.log("URL OFFSET", url_offset, tex_offset)
            url_offset[url] = tex_offset;
            tex_offset += 1;
        }
        gl.activeTexture(gl.TEXTURE2 + url_offset[url]);
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

        const image = new Image();
        image.src = url;

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image,
            );

            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };

        return texture;
    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    // LIGHT DIR IS A GLOBAL VAR
    setLightDirection(lightDirection: number[]) {
        light_dir = lightDirection;
    }
}
