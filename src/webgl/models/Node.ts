import { Transforms } from '@/app/canvas';
import m4 from '../utils/m4';
import * as primitives from '../utils/primitives';
import TRS from '../utils/trs';
import * as webglUtils from "../utils/webGlUtils";

export class Node {
    children: Node[];
    localMatrix: number[];
    worldMatrix: number[];
    source: any;
    parent: Node | null;
    draw: boolean;
    drawInfo: any;
    cubeBufferInfo: any;
    programInfo: any;
    name: string;

    constructor() {
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
        this.source = new TRS();
        this.parent = null;
        this.draw = false;
        this.name= "";
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

    buildByDescription(nodeDescription: any, programInfo: any) {
        this.programInfo = programInfo;
        let trs = this.source
        trs.translation = nodeDescription.translation || trs.translation;
        trs.rotation = nodeDescription.rotation || trs.rotation;
        trs.scale = nodeDescription.scale || trs.scale;

        this.name = nodeDescription.name;

        if (nodeDescription.draw !== false) {
            this.drawInfo = {
                uniforms: {
                    u_colorOffset: [0, 0, 0.6, 0],
                    u_colorMult: [0.4, 0.4, 0.4, 1],
                },
                programInfo: programInfo,
                bufferInfo: null,
            };
            this.draw = true;
        } else {
            this.draw = false;
        }


        let childrenNodes = this.makeNodes(nodeDescription.children, programInfo)


        // set parent to this for every childrenNodes
        for (let i = 0; i < childrenNodes.length; i++) {
            if (childrenNodes[i] instanceof Node) {
                childrenNodes[i].setParent(this);
            }
        }
        return this;
    }

    makeNodes(nodeDescriptions: any, programInfo: any) {
        // @ts-ignore
        return nodeDescriptions ? nodeDescriptions.map((node) => {
            const childNode = new Node();
            return childNode.buildByDescription(node, programInfo)
        }) : [];
    }

    drawNode(gl: any, viewProjectionMatrix: any) {
        if (this.draw) {
            this.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, this.worldMatrix);

            let programInfo = this.drawInfo.programInfo;
            let bufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 1)

            gl.useProgram(programInfo.program);;

            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            webglUtils.setUniforms(this.programInfo, this.drawInfo.uniforms);
            gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        } else {
            console.log("NOT DRAWING!")
        }

        this.children.forEach((child) => {
            child.drawNode(gl, viewProjectionMatrix);
        })
    }

    procedureGetNodeRefDict(nodeDict: any, level = 0) {
        nodeDict[this.name] = {
            "node": this,
            "level": level
        }
        this.children.forEach((child) => {
            child.procedureGetNodeRefDict(nodeDict, level + 1);
        })
    }

    addTransform(transform: Transforms) {
        this.source.setDelta(transform);
    }
}
