import { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateCapsule } from '@babylonjs/core/Meshes/Builders/capsuleBuilder';
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder';
import '@babylonjs/core/Culling/ray';
const MeshBuilder = { CreateBox, CreateSphere, CreateCapsule, CreateTorus, CreateLines };
import type { Locale } from '../story/story';
interface Props {
  place: number;
  hero: 'katya' | 'olya';
  low: boolean;
  paused: boolean;
  locale: Locale;
  onInspect: () => void;
}
export default function World({ place, hero, low, paused, locale, onInspect }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const callback = useRef(onInspect);
  callback.current = onInspect;
  const active = useRef(hero);
  active.current = hero;
  const pause = useRef(paused);
  pause.current = paused;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    let engine: Engine | undefined;
    let cleanup = () => {};
    try {
      engine = new Engine(
        canvas.current,
        true,
        { preserveDrawingBuffer: false, stencil: true, antialias: !low },
        true
      );
      engine.setHardwareScalingLevel(low ? 2 : Math.max(1, window.devicePixelRatio / 1.5));
      const scene = new Scene(engine);
      scene.clearColor = new Color4(0.043, 0.093, 0.11, 1);
      scene.ambientColor = new Color3(0.4, 0.35, 0.3);
      const camera = new ArcRotateCamera(
        'camera',
        Math.PI / 2 + 0.25,
        Math.PI / 3.1,
        26,
        new Vector3(0, 1, 1),
        scene
      );
      camera.attachControl(canvas.current, true);
      camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');
      camera.lowerRadiusLimit = 14;
      camera.upperRadiusLimit = 34;
      camera.lowerBetaLimit = 0.4;
      camera.upperBetaLimit = 1.25;
      camera.panningSensibility = 0;
      camera.wheelPrecision = 30;
      const light = new HemisphericLight('sky', new Vector3(-0.7, 1, -0.6), scene);
      light.intensity = 1.2;
      light.diffuse = Color3.FromHexString('#ffdfb1');
      light.groundColor = Color3.FromHexString('#35505c');
      const mats = new Map<string, StandardMaterial>();
      function mat(hex: string, glow = false) {
        let key = hex + glow;
        let m = mats.get(key);
        if (!m) {
          m = new StandardMaterial(key, scene);
          m.diffuseColor = Color3.FromHexString(hex);
          m.specularColor = Color3.Black();
          if (glow) m.emissiveColor = Color3.FromHexString(hex).scale(0.6);
          mats.set(key, m);
        }
        return m;
      }
      function box(
        name: string,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        color: string
      ) {
        const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
        m.position.set(x, y, z);
        m.material = mat(color);
        return m;
      }
      function ball(
        name: string,
        x: number,
        y: number,
        z: number,
        r: number,
        color: string,
        glow = false
      ) {
        const m = MeshBuilder.CreateSphere(name, { diameter: r, segments: 8 }, scene);
        m.position.set(x, y, z);
        m.material = mat(color, glow);
        return m;
      }
      box('island', 0, -0.4, 0, 22, 0.7, 18, '#293f42');
      const ground = box('ground', 0, -0.03, 0, 22, 0.12, 18, '#b49b77');
      for (let z = -8; z < 9; z += 1.4)
        for (let x = -10; x < 11; x += 1.4) {
          const tile = box(
            'paver',
            x,
            0.045,
            z,
            1.3,
            0.035,
            1.3,
            (Math.round(x + z) * 7) % 3 ? '#af9573' : '#a08766'
          );
          tile.isPickable = false;
        }
      box('water', 0, -0.05, 11, 35, 0.1, 5, '#287b7e');
      for (let i = 0; i < 20; i++) {
        const wave = box(
          'reflection',
          -15 + i * 1.6,
          0.02,
          10 + (i % 3) * 0.6,
          0.7,
          0.025,
          0.035,
          '#8cb6a2'
        );
        wave.isPickable = false;
      }
      function house(x: number, z: number, w: number, col: string, h = 5) {
        box('facade', x, h / 2, z, w, h, 3.2, col);
        for (const side of [-1, 1]) {
          const roof = box('roof', x, h + 0.35, z + side * 0.95, w + 0.5, 0.18, 2.15, '#3c514e');
          roof.rotation.x = side * 0.28;
        }
        for (let xx = x - w / 2 + 0.8; xx < x + w / 2; xx += 1.5) {
          box('shutter', xx, 3.4, z + 1.65, 0.85, 1.4, 0.1, '#224b4b');
          box('light-window', xx, 3.4, z + 1.72, 0.53, 0.85, 0.05, '#efc476').material = mat(
            '#efc476',
            true
          );
        }
        box('door', x, 1.1, z + 1.66, 1.25, 2.2, 0.12, '#2b504c');
        box('awning', x, 2.6, z + 2.1, w + 0.25, 0.17, 1.1, '#86684c');
      }
      house(-6, -5.3, 6, '#c19d58');
      house(1, -6, 6, '#d2ad65', 6);
      house(7, -5.5, 4.5, '#ba7f55', 4.7);
      house(-8, 1, 3, '#b59b62');
      function plant(x: number, z: number) {
        box('pot', x, 0.35, z, 0.7, 0.7, 0.7, '#7f5541');
        for (let j = 0; j < 5; j++) {
          let a = j * 1.25;
          const leaf = ball(
            'leaf',
            x + Math.cos(a) * 0.4,
            1.15 + Math.sin(j) * 0.2,
            z + Math.sin(a) * 0.4,
            1,
            '#486d4a'
          );
          leaf.scaling.set(0.45, 1.2, 0.6);
          leaf.rotation.z = Math.cos(a) * 0.6;
        }
      }
      [
        [-4, -2.5],
        [4, -3],
        [9, -2],
        [-6, 3],
        [8, 5],
        [-9, 6],
      ].forEach(([x, z]) => plant(x, z));
      for (let row = 0; row < 3; row++) {
        let z = -2 + row * 3.4;
        const points = [];
        for (let i = 0; i <= 12; i++)
          points.push(new Vector3(-9 + i * 1.5, 6 - Math.sin((i / 12) * Math.PI) * 1.4, z));
        MeshBuilder.CreateLines('string', { points }, scene);
        for (let i = 1; i < 12; i++) {
          let x = -9 + i * 1.5,
            y = 6 - Math.sin((i / 12) * Math.PI) * 1.4;
          let color = ['#ef9953', '#d45745', '#e7c585'][i % 3];
          let l = ball('lantern', x, y - 0.35, z, 0.58, color, true);
          l.scaling.y = 1.25;
          box('tassel', x, y - 0.9, z, 0.045, 0.5, 0.045, color);
        }
      }
      if (place === 1) {
        for (let i = 0; i < 3; i++) {
          let x = -4 + i * 4;
          box('market-stall', x, 0.7, 3.5, 2.6, 1.4, 1.4, '#7a5942');
          box('canopy', x, 2.9, 3.5, 3.1, 0.2, 2.1, ['#c9654b', '#799177', '#d7b573'][i]);
          for (const dx of [-1.2, 1.2]) box('post', x + dx, 1.5, 3.5, 0.1, 3, 0.1, '#584b36');
          for (let j = 0; j < 5; j++)
            ball('fruit', x - 1 + j * 0.45, 1.55, 3.5, 0.35, j % 2 ? '#d1af42' : '#668c45');
        }
      }
      if (place === 2) {
        for (let x = -8; x < 9; x += 2) {
          box('rail', x, 0.8, 7, 0.12, 1.6, 0.12, '#685942');
        }
        box('rail-top', 0, 1.5, 7, 18, 0.12, 0.12, '#685942');
        box('pier', 3, 0, 9.4, 3, 0.15, 5, '#8e7756');
        const boat = ball('boat', 4, -0.02, 11, 2.3, '#74493b');
        boat.scaling.set(1.7, 0.35, 0.65);
      }
      function person(name: string, x: number, z: number, color: string) {
        let root = new TransformNode(name, scene);
        let body = MeshBuilder.CreateCapsule(
          name,
          { height: 1.25, radius: 0.26, tessellation: 8 },
          scene
        );
        body.material = mat(color);
        body.parent = root;
        body.position.y = 0.95;
        let head = ball(name, 0, 1.83, 0, 0.46, '#dfaf86');
        head.parent = root;
        let hair = ball(name, 0, 1.98, 0.04, 0.48, '#48382e');
        hair.scaling.y = 0.6;
        hair.parent = root;
        for (let dx of [-0.13, 0.13]) {
          let leg = box(name, dx, 0.27, 0, 0.17, 0.65, 0.19, '#294a53');
          leg.parent = root;
        }
        root.position.set(x, 0, z);
        return root;
      }
      const katya = person('Катя', -1, 1, '#d57543');
      const olya = person('Оля', 0.1, 1.3, '#4e9caa');
      const npc = person(
        'talk',
        place === 0 ? -4 : place === 1 ? 0 : 4,
        place === 1 ? 2 : place === 2 ? 5 : -2,
        '#bdbea0'
      );
      const beacon = MeshBuilder.CreateTorus(
        'talk',
        { diameter: 1.5, thickness: 0.07, tessellation: 24 },
        scene
      );
      beacon.position = npc.position.add(new Vector3(0, 0.12, 0));
      beacon.material = mat('#f7d68f', true);
      let target = katya.position.clone();
      let keys = new Set<string>();
      const down = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement)?.matches('input,button,select,textarea')) return;
        if (
          [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'w',
            'a',
            's',
            'd',
            'ц',
            'ф',
            'ы',
            'в',
          ].includes(e.key)
        ) {
          e.preventDefault();
          keys.add(e.key);
        }
      };
      const up = (e: KeyboardEvent) => keys.delete(e.key);
      const blur = () => keys.clear();
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      window.addEventListener('blur', blur);
      scene.onPointerObservable.add((info) => {
        if (info.type !== PointerEventTypes.POINTERTAP || pause.current) return;
        let hit = info.pickInfo;
        if (hit?.pickedMesh?.name === 'talk') {
          callback.current();
          return;
        }
        const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === ground);
        if (pick?.pickedPoint) target = pick.pickedPoint.clone();
      });
      const resize = () => engine?.resize();
      window.addEventListener('resize', resize);
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.current);
      const loop = () => {
        if (document.hidden || pause.current) return;
        const delta = Math.min(engine!.getDeltaTime() / 1000, 0.05);
        let dx = 0,
          dz = 0;
        if (keys.has('w') || keys.has('ц') || keys.has('ArrowUp')) dz = -1;
        if (keys.has('s') || keys.has('ы') || keys.has('ArrowDown')) dz = 1;
        if (keys.has('a') || keys.has('ф') || keys.has('ArrowLeft')) dx = -1;
        if (keys.has('d') || keys.has('в') || keys.has('ArrowRight')) dx = 1;
        const lead = active.current === 'katya' ? katya : olya,
          follow = active.current === 'katya' ? olya : katya;
        if (dx || dz) target = lead.position.add(new Vector3(dx, 0, dz));
        target.x = Math.max(-5.4, Math.min(8, target.x));
        target.z = Math.max(-1, Math.min(6.2, target.z));
        const dir = target.subtract(lead.position);
        dir.y = 0;
        if (dir.length() > 0.08)
          lead.position.addInPlace(dir.normalize().scale(Math.min(3 * delta, dir.length())));
        const ft = lead.position.add(new Vector3(0.9, 0, 0.7));
        follow.position = Vector3.Lerp(follow.position, ft, delta * 3);
        scene.render();
      };
      engine.runRenderLoop(loop);
      cleanup = () => {
        ro.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
        window.removeEventListener('blur', blur);
        scene.dispose();
        engine?.dispose();
      };
    } catch {
      engine?.dispose();
      setFailed(true);
    }
    return cleanup;
  }, [place, low]);
  return failed ? (
    <div className="world-fallback">
      <p>
        {locale === 'ru'
          ? '3D недоступно на этом устройстве. История полностью доступна через кнопки ниже.'
          : '3D is unavailable. The full story remains accessible using the buttons below.'}
      </p>
    </div>
  ) : (
    <canvas
      ref={canvas}
      aria-label={
        locale === 'ru'
          ? '3D-локация. Нажмите на землю для перемещения.'
          : '3D scene. Tap the ground to move.'
      }
      tabIndex={0}
    />
  );
}
