import { ArticulatedDescriptions, CameraInformation, HollowDescriptions, Transforms, ShadingInfo } from '@/app/type';
import m4 from '../utils/m4';
import * as primitives from '../utils/primitives';
import TRS from '../utils/trs';
import * as webglUtils from "../utils/webGlUtils";
import { degToRad } from '../utils/radians';

var id_global = 1;
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
        }
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

        // Articulated model position, color normal is always cube (hardcode).
        // TODO: make this dynamic
        let cubeVertices = primitives.createCubeVertices(1);
        let vertices = primitives.deindexVertices(cubeVertices);
        // console.log(vertices)
        // vertices = primitives.makeColor(vertices, this.shadingInfo.ambientColor);
        // console.log(this.shadingInfo.ambientColor)
        // vertices = primitives.makeRandomVertexColors(vertices, {
        //     vertsPerColor: 6,
        //     rand: function (ndx, channel) {
        //         return channel < 3 ? ((128 + Math.random() * 128) | 0) : 255;
        //     },
        // });
        // console.log(vertices.colors)

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
        console.log("LENGTH POINT", lengthPoint)
        let textureArrBase = [
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            1, 1,
        ];

        // NOT SURE ABOUT TEXTURE HERE
        let textureArr: number[] = [];
        for (let i = 0; i < lengthPoint; i++) {
            textureArr = textureArr.concat(textureArrBase);
        }
        for (let i = 0; i < nodeDescription.positions.length; i++) {
            nodeDescription.positions[i] = nodeDescription.positions[i] * 0.01;
        }
        // const colors = primitives.makeColorLen(nodeDescription.positions.length, this.shadingInfo.ambientColor);
        this.arrayInfo = {
            position: nodeDescription.positions,
            // color: colors,
            normal: nodeDescription.normals,
            texcoord: new Float32Array(textureArr)
        }
        // console.log(this.arrayInfo)
        // this.position = nodeDescription.positions;
        // this.color = nodeDescription.colors;
        // this.normal = nodeDescription.normals;
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

    drawNode(gl: WebGLRenderingContext, viewProjectionMatrix: number[], programInfo: any) {
        if (this.draw) {
            // set shader uniforms
            let uniforms = {
                // u_colorOffset: [0, 0, 0.6, 0],
                // u_colorMult: [0.4, 0.4, 0.4, 1],
                u_id: [
                    ((this.id >> 0) & 0xFF) / 0xFF,
                    ((this.id >> 8) & 0xFF) / 0xFF,
                    ((this.id >> 16) & 0xFF) / 0xFF,
                    ((this.id >> 24) & 0xFF) / 0xFF,
                ],
                // u_matrix: [],
                u_color: this.shadingInfo.ambientColor,
                u_reverseLightDirection: [1, 1, 1],
                u_worldViewProjection: [],
                // u_world: [],
                u_worldInverseTranspose: [],

                mode: this.shadingInfo.mode,
                u_diffuseColor: this.shadingInfo.diffuseColor,
                u_shininess: this.shadingInfo.shininess,
                u_specularColor: this.shadingInfo.specularColor,
            }
            // uniforms.u_matrix = m4.multiply(viewProjectionMatrix, this.worldMatrix);
            const u_world = m4.yRotation(this.cameraInformation.cameraAngleXRadians);

            uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, this.worldMatrix);
            uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(u_world));
            // console.log("ARRAYS INFO", this.arrayInfo)

            let bufferInfo = webglUtils.createBufferInfoFromArrays(gl, this.arrayInfo);

            gl.useProgram(programInfo.program);

            // this function will set attribute vec4 in shader
            // this will follow pass all attribs in bufferInfo
            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            // This function will set all uniforms in the shaders.
            // This will pass all uniforms 
            webglUtils.setUniforms(programInfo, uniforms);

            webglUtils.drawBufferInfo(gl, bufferInfo);
        } else {
            console.log("NOT DRAWING!")
        }

        this.children.forEach((child) => {
            child.drawNode(gl, viewProjectionMatrix, programInfo);
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
}
