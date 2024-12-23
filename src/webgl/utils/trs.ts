import { Transforms } from '@/app/type.jsx';
import m4 from './m4.js';
import { degToRad } from './radians.ts';

class TRS {
    translation: number[];
    rotation: number[];
    scale: number[];
    delta: Transforms;

    constructor() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.delta = {
            translate: { x: 0, y: 0, z: 0 },
            scale: { x: 0, y: 0, z: 0 },
            rotate: { x: 0, y: 0, z: 0 }
        }
    }

    // @ts-ignore
    getMatrix(dst) {
        // make a local copy of translation, then add with setDelta
        const t = this.translation.slice();
        const r = this.rotation.slice();
        const s = this.scale.slice();
        const d = this.delta;

        t[0] += d.translate.x;
        t[1] += d.translate.y;
        t[2] += d.translate.z;
        r[0] += d.rotate.x;
        r[1] += d.rotate.y;
        r[2] += d.rotate.z;
        s[0] += d.scale.x;
        s[1] += d.scale.y;
        s[2] += d.scale.z;

        dst = dst || new Float32Array(16);
        // const t = this.translation;
        // const r = this.rotation;
        // const s = this.scale;
        m4.translation(t[0], t[1], t[2], dst);
        m4.xRotate(dst, r[0], dst);
        m4.yRotate(dst, r[1], dst);
        m4.zRotate(dst, r[2], dst);
        m4.scale(dst, s[0], s[1], s[2], dst);
        return dst;
    }

    setDelta(transform: Transforms) {
        this.delta = transform;
    }

    setTransform(transform: Transforms) {
        this.translation = [transform.translate.x, transform.translate.y, transform.translate.z];
        this.rotation = [transform.rotate.x, transform.rotate.y, transform.rotate.z];
        this.scale = [transform.scale.x, transform.scale.y, transform.scale.z];
    }

    getTranslateWDelta() {
        const t = this.translation.slice();
        const d = this.delta.translate;
        t[0] += d.x;
        t[1] += d.y;
        t[2] += d.z;
        return t;
    }

    getRotateWDelta() {
        const r = this.rotation.slice();
        const d = this.delta.rotate;
        r[0] += d.x;
        r[1] += d.y;
        r[2] += d.z;
        return r;
    }

    getScaleWDelta() {
        const s = this.scale.slice();
        const d = this.delta.scale;
        s[0] += d.x;
        s[1] += d.y;
        s[2] += d.z;
        return s;
    }
}


export default TRS;