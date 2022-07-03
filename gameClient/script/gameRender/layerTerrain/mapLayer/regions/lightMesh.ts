import {Geometry, Mesh, Shader } from "pixi.js";

import {iGameData_Map} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {eGlobalLightType} from "../../../../../../gameBase/gameConstState/world/worldState.type";
import {vector2, vector3} from "../../../../../../script_base/@type/graph";
import {float, int} from "../../../../../../script_base/util/number";

export interface iMapLightMeshProps {
    globalLightType: eGlobalLightType,
    globalLightPos: vector3<float>,   // [x, y, height]
    mapData: iGameData_Map,
}

export function getMapLightMesh(props: iMapLightMeshProps): Mesh {
    const params = _lightMeshPropsToParams(props);

    const geometry = new Geometry();
    Object.keys(eAttrs).forEach(key => {
        geometry.addAttribute(key, params.attrs[key][0], params.attrs[key][1]);
    })
    geometry.addIndex(params.indexes);
    geometry.interleave();

    const shader = Shader.from(`
    precision mediump float;

    attribute vec2 ${eAttrs.aVertexPosition};
    attribute vec2 ${eAttrs.aTriVertA};
    attribute vec2 ${eAttrs.aTriVertB};
    attribute vec2 ${eAttrs.aTriVertC};
    attribute vec3 ${eAttrs.aElevationRs};
    attribute float ${eAttrs.aElevationT};

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    
    uniform int ${eUniforms.globalLightType};
    uniform vec3 ${eUniforms.globalLightPos};
    uniform vec2 ${eUniforms.meshSize};

    varying vec3 vColor;
    
    void main() {
        float lightScaleZ = 50.0;
    
        float az = ${eAttrs.aElevationRs}.x;
        float bz = ${eAttrs.aElevationRs}.y;
        float cz = ${eAttrs.aElevationRs}.z;
        
        az *= lightScaleZ;
        bz *= lightScaleZ;
        cz *= lightScaleZ;
        
        float ux = ${eAttrs.aTriVertB}.x - ${eAttrs.aTriVertA}.x;
        float uy = ${eAttrs.aTriVertB}.y - ${eAttrs.aTriVertA}.y;
        float uz = bz - az;
        float vx = ${eAttrs.aTriVertC}.x - ${eAttrs.aTriVertA}.x;
        float vy = ${eAttrs.aTriVertC}.y - ${eAttrs.aTriVertA}.y;
        float vz = cz - az;
        
        float nx = uy * vz - uz * vy;
        float ny = uz * vx - ux * vz;
        float nz = ux * vy - uy * vx;
    
        float length = -sqrt(nx * nx + ny * ny + nz * nz);
        nx /= length;
        ny /= length;
        nz /= length;
        
        float dotProduct = nx * ${eUniforms.globalLightPos}.x + ny * ${eUniforms.globalLightPos}.y + nz * ${eUniforms.globalLightPos}.z;
        float light = 0.5 + 10.0 * dotProduct; 
        light = mix(clamp(light, 0.0, 1.0), ${eAttrs.aElevationT}, 0.5);
        
        float darkMax = 0.5;
        float powerTwo = (1.0 - darkMax) * (1.0 - darkMax);
        
        float lightDiff = light - darkMax;
        light = light - (powerTwo - lightDiff * lightDiff)/powerTwo * lightDiff / 1.5;
        
        vec3 midLight = vec3(0.5);
        vec3 q1Light = mix(vec3(0.0), vec3(1.0, 0.9841, 0.7019), 0.9);
        vec3 q3Light = mix(vec3(0.0), vec3(1.0, 0.5372, 0.1294), 0.9);
        vec3 edgeLight = mix(vec3(0.1490, 0.1921, 0.2784), vec3(1.0), 0.35);
        
        
        float sunX = ${eUniforms.globalLightPos}.x;
        float daySeaLight = 0.4;
        float nightSeaLight = 0.15;
        float dayDarkestShadow = 0.2;
        float nightDarkestShadow = 0.1;
        vec3 airLight;
        
        
        if (${eUniforms.globalLightType} == 0) {
            if (sunX > -0.5 && sunX <= 0.0) {
                airLight = mix(q3Light, midLight, (sunX + 0.5) * 2.0);
            } else if (sunX > 0.0 && sunX < 0.5) {
                airLight = mix(midLight, q1Light, sunX * 2.0);
            } else if (sunX <= -0.5) {
                airLight = mix(edgeLight, q3Light, (1.0 + sunX) * 2.0);
            } else if (sunX >= 0.5) {
                airLight = mix(q1Light, edgeLight, (sunX - 0.5) * 2.0);
            }
        
            vColor = mix(vec3(light), airLight, 0.2);
            vColor = mix(vColor, airLight * vec3(light), abs(sunX));
            
            if (${eAttrs.aElevationT} < 0.04) {
                vColor = clamp(vColor, vec3(mix(daySeaLight, nightSeaLight, abs(sunX))), vec3(1.0));
            } else {
                vColor = clamp(vColor, vec3(mix(dayDarkestShadow, nightDarkestShadow, abs(sunX))), vec3(1.0));
            }
        } else {
            airLight = edgeLight;
            vColor = airLight * vec3(light); 
            
            if (${eAttrs.aElevationT} < 0.04) {
                vColor = clamp(vColor, vec3(nightSeaLight), vec3(1.0));
            } else {
                vColor = clamp(vColor, vec3(nightDarkestShadow), vec3(1.0));
            }
        }
        
    
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
    `,
        `
    precision mediump float;
    
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
    `,
        params.uniforms)

    return new Mesh(geometry, shader as any);
}

export enum eAttrs {
    aVertexPosition = "aVertexPosition",
    aTriVertA = "aTriVertA",
    aTriVertB = "aTriVertB",
    aTriVertC = "aTriVertC",
    aElevationRs = "aElevationRs",
    aElevationT = "aElevationT",
}

export enum eUniforms {
    globalLightType = "globalLightType",
    globalLightPos = "globalLightPos",
    meshSize = "meshSize",
}

interface iShaderAttrs {
    [eAttrs.aVertexPosition]: [float[], int],  // r_vertex
    [eAttrs.aTriVertA]: [float[], int],  // t_vertex
    [eAttrs.aTriVertB]: [float[], int],  // t_vertex
    [eAttrs.aTriVertC]: [float[], int],  // t_vertex
    [eAttrs.aElevationRs]: [float[], int],  // t_elevation * 3
    [eAttrs.aElevationT]: [float[], int],  // t_elevation
}

interface iShaderUniforms {
    [eUniforms.globalLightType]: eGlobalLightType,
    [eUniforms.globalLightPos]: vector3<float>,
    [eUniforms.meshSize]: vector2<float>,
}

interface iShaderParams {
    attrs: iShaderAttrs,
    uniforms: iShaderUniforms,
    indexes: int[],
}

export interface iGlobalLightShaderUniforms {
    [eUniforms.globalLightType]: eGlobalLightType,
    [eUniforms.globalLightPos]: Float32Array,
    [eUniforms.meshSize]: Float32Array,
}

function _lightMeshPropsToParams(props: iMapLightMeshProps): iShaderParams {
    const {globalLightType, globalLightPos, mapData} = props;
    const mapMesh = mapData.mesh;

    const {t_elevation, r_elevation} = mapData.buffer;

    const vertex = [],
        triangleVertexA = [],
        triangleVertexB = [],
        triangleVertexC = [],
        elevationRs = [],
        elevationT = [];

    for (let t = 0; t < mapMesh.state.numSolidTriangles; t++) {
        vertex.push(...mapMesh.__t_vertex(t));
        const tCircR = mapMesh.t_circulate_r([], t);

        triangleVertexA.push(...mapMesh.__r_vertex(tCircR[0]));
        triangleVertexB.push(...mapMesh.__r_vertex(tCircR[1]));
        triangleVertexC.push(...mapMesh.__r_vertex(tCircR[2]));
        elevationRs.push(...tCircR.map(r => {
            return r_elevation[r]
        }))
        elevationT.push(t_elevation[t]);
    }

    const attrs: iShaderAttrs = {
        [eAttrs.aVertexPosition]: [vertex, 2],
        [eAttrs.aTriVertA]: [triangleVertexA, 2],
        [eAttrs.aTriVertB]: [triangleVertexB, 2],
        [eAttrs.aTriVertC]: [triangleVertexC, 2],
        [eAttrs.aElevationRs]: [elevationRs, 3],
        [eAttrs.aElevationT]: [elevationT, 1],
    }
    const uniforms: iShaderUniforms = {
        globalLightType,
        globalLightPos,
        meshSize: mapMesh.state.meshSize,
    }

    return {
        attrs,
        uniforms,
        indexes: ((): float[] => {
            const indexes = [];

            for (let r = 0; r < mapMesh.state.numSolidRegions; r++) {
                if (r < mapMesh.state.numBoundaryRegions) {
                    continue;
                }
                const triangles = mapMesh.r_circulate_t([], r);
                for (let ti = 2; ti < triangles.length; ti++) {
                    indexes.push(triangles[0], triangles[ti - 1], triangles[ti]);
                }
            }

            return indexes;
        })()
    }
}