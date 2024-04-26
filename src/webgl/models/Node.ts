import m4 from '../utils/m4';

export class Node {
    children: Node[];
    localMatrix: number[];
    worldMatrix: number[];
    source: any;
    parent: Node | null;

    constructor(source: any) {
        this.children = [];
        this.localMatrix = m4.identity(); // Assuming m4 is defined elsewhere
        this.worldMatrix = m4.identity(); // Assuming m4 is defined elsewhere
        this.source = source;
        this.parent = null;
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
            // a matrix was passed in so do the math
            m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
        } else {
            // no matrix was passed in so just copy local to world
            m4.copy(this.localMatrix, this.worldMatrix);
        }

        // now process all the children
        const worldMatrix = this.worldMatrix;
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        });
    }
}
