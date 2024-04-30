import { Transforms } from '@/app/canvas';
import m4 from '../utils/m4';
import * as primitives from '../utils/primitives';
import TRS from '../utils/trs';
import * as webglUtils from "../utils/webGlUtils";

var id_global = 1;
export class Node {
    position: number[];
    color: number[];
    normal: number[];
    children: Node[];
    localMatrix: number[];
    worldMatrix: number[];
    source: any;
    parent: Node | null;
    draw: boolean;
    drawInfo: any;
    cubeBufferInfo: any;
    name: string;
    arrayInfo: any;
    id: number;

    constructor() {
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
        this.source = new TRS();
        this.parent = null;
        this.draw = false;
        this.name = "";
        this.position = [];
        this.color = [];
        this.normal = [];
        this.arrayInfo = {};
        this.id = id_global;
        id_global += 1;
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

    buildArticulated(nodeDescription: any) {
        let trs = this.source
        trs.translation = nodeDescription.translation || trs.translation;
        trs.rotation = nodeDescription.rotation || trs.rotation;
        trs.scale = nodeDescription.scale || trs.scale;

        this.name = nodeDescription.name;

        this.draw = nodeDescription.draw !== false;

        // Articulated model position, color normal is always cube (hardcode).
        // TODO: make this dynamic
        let cubeVertices = primitives.createCubeVertices(1);
        // this.position = cubeVertices.position;
        // this.color = cubeVertices.color;
        // this.normal = cubeVertices.normal;
        this.arrayInfo = cubeVertices;


        let childrenNodes = this.makeNodes(nodeDescription.children, "articulated")


        // set parent to this for every childrenNodes
        for (let i = 0; i < childrenNodes.length; i++) {
            if (childrenNodes[i] instanceof Node) {
                childrenNodes[i].setParent(this);
            }
        }
        return this;
    }

    buildHollow(nodeDescription: any) {
        this.draw = true;
        this.arrayInfo = {
            position: nodeDescription.positions,
            color: nodeDescription.colors,
            normal: nodeDescription.normals,
        }
        // this.position = nodeDescription.positions;
        // this.color = nodeDescription.colors;
        // this.normal = nodeDescription.normals;
        this.name = nodeDescription.name;
        return this;
    }

    buildByDescription(nodeDescription: any) {
        if (nodeDescription.type === "articulated") {
            return this.buildArticulated(nodeDescription);
        }
        else {
            return this.buildHollow(nodeDescription);
        }
    }

    makeNodes(nodeDescriptions: any, type: any) {
        // @ts-ignore
        return nodeDescriptions ? nodeDescriptions.map((node) => {
            node["type"] = type;
            const childNode = new Node();
            return childNode.buildByDescription(node)
        }) : [];
    }

    drawNode(gl: any, viewProjectionMatrix: any, programInfo: any) {
        if (this.draw) {
            // set shader uniforms
            let uniforms = {
                u_colorOffset: [0, 0, 0.6, 0],
                u_colorMult: [0.4, 0.4, 0.4, 1],
                u_id: [
                    ((this.id >> 0) & 0xFF) / 0xFF,
                    ((this.id >> 8) & 0xFF) / 0xFF,
                    ((this.id >> 16) & 0xFF) / 0xFF,
                    ((this.id >> 24) & 0xFF) / 0xFF,
                ],
            }
            uniforms.u_matrix = m4.multiply(viewProjectionMatrix, this.worldMatrix);

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

    getById(id: any) {
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
}
