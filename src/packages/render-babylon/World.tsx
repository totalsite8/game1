import { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder';
import '@babylonjs/core/Culling/ray';
const MeshBuilder = { CreateBox, CreateSphere, CreateTorus, CreateLines };
import type { Locale } from '../story/story';
import { Humanoid, Palette, angleTo } from './humanoid';
import { HEROINES, TOWNSFOLK, VIETNAMESE_NPCS, type NpcProfile } from '../content/characters';
import type { LocationId } from '../validation/schemas';
interface Props {
  place: number;
  hero: 'katya' | 'olya';
  low: boolean;
  paused: boolean;
  locale: Locale;
  /** Кто сейчас говорит в сцене: id героини или NPC. Управляет жестикуляцией и взглядом. */
  speaker?: string;
  onInspect: () => void;
}
/** Локации, соответствующие трём процедурным диорамам. */
const PLACE_LOCATIONS: LocationId[][] = [
  ['hotel_alley'],
  ['night_market'],
  ['riverfront_pier', 'lantern_terrace'],
];
/** Маршруты фоновых горожан: замкнутый контур по краю площадки. */
const WALK_PATHS: [number, number][][] = [
  [
    [-9.5, 4.4],
    [9.5, 4.4],
    [9.5, 6.6],
    [-9.5, 6.6],
  ],
  [
    [-9.5, 5.2],
    [9.5, 5.2],
    [9.5, 6.8],
    [-9.5, 6.8],
  ],
  [
    [-9.5, 3.6],
    [9.5, 3.6],
    [9.5, 5.6],
    [-9.5, 5.6],
  ],
];
export default function World({ place, hero, low, paused, locale, speaker, onInspect }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const callback = useRef(onInspect);
  callback.current = onInspect;
  const active = useRef(hero);
  active.current = hero;
  const pause = useRef(paused);
  pause.current = paused;
  const speakerRef = useRef(speaker);
  speakerRef.current = speaker;
  const [failed, setFailed] = useState(false);
  const [cast, setCast] = useState<NpcProfile[]>([]);
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
      // Персонажей много, поэтому луч берётся только по нажатию, а не на каждое движение мыши.
      scene.skipPointerMovePicking = true;
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

      // ── Персонажи ────────────────────────────────────────────────────────
      // Высота мощения: персонажи стоят на плитке, а не в её толще.
      const GROUND_Y = 0.063;
      const palette = new Palette(scene);
      const katya = new Humanoid('Катя', HEROINES.katya.look, palette, scene, {
        detail: low ? 1 : 2,
        facing: 0.35,
      });
      const olya = new Humanoid('Оля', HEROINES.olya.look, palette, scene, {
        detail: low ? 1 : 2,
        facing: 0.35,
      });
      katya.root.position.set(-1, GROUND_Y, 1);
      olya.root.position.set(0.1, GROUND_Y, 1.3);

      const castProfiles = VIETNAMESE_NPCS.filter((n) =>
        PLACE_LOCATIONS[place]?.includes(n.location)
      );
      setCast(castProfiles);
      const npcs = castProfiles.map((profile) => {
        const rig = new Humanoid(profile.id, profile.look, palette, scene, {
          detail: low ? 0 : 1,
          facing: profile.facing,
        });
        rig.root.position.set(profile.position_3d[0], GROUND_Y, profile.position_3d[2]);
        rig.setPickTag('npc');
        return { profile, rig };
      });

      const pathInfo = (pts: [number, number][]) => {
        const segs = pts.map(([x, z], i) => {
          const [nx, nz] = pts[(i + 1) % pts.length];
          return { x, z, nx, nz, len: Math.hypot(nx - x, nz - z) };
        });
        return { segs, total: segs.reduce((a, s) => a + s.len, 0) };
      };
      const pointAt = (info: ReturnType<typeof pathInfo>, dist: number) => {
        let d = ((dist % info.total) + info.total) % info.total;
        for (const s of info.segs) {
          if (d <= s.len) {
            const t = s.len > 0 ? d / s.len : 0;
            return {
              x: s.x + (s.nx - s.x) * t,
              z: s.z + (s.nz - s.z) * t,
              dir: Math.atan2(s.nx - s.x, s.nz - s.z),
            };
          }
          d -= s.len;
        }
        const s = info.segs[0];
        return { x: s.x, z: s.z, dir: Math.atan2(s.nx - s.x, s.nz - s.z) };
      };
      const walkers = low
        ? []
        : TOWNSFOLK.slice(0, 2).map((look, i) => {
            const rig = new Humanoid(`townsfolk-${i}`, look, palette, scene, {
              detail: 0,
              facing: 0,
            });
            const info = pathInfo(WALK_PATHS[place] ?? WALK_PATHS[0]);
            const start = pointAt(info, i * (info.total / 2) + 1.5);
            rig.root.position.set(start.x, GROUND_Y, start.z);
            return { rig, info, dist: i * (info.total / 2) + 1.5, speed: 0.95 + i * 0.22 };
          });

      const beacon = MeshBuilder.CreateTorus(
        'talk',
        { diameter: 1.5, thickness: 0.07, tessellation: 24 },
        scene
      );
      beacon.material = mat('#f7d68f', true);
      beacon.isPickable = false;

      // Отдельный свет только для персонажей: сцена не меняется, а фигуры читаются объёмнее.
      const characterMeshes = [
        ...katya.meshes,
        ...olya.meshes,
        ...npcs.flatMap((n) => n.rig.meshes),
        ...walkers.flatMap((w) => w.rig.meshes),
      ];
      // Направление — ход луча: свет приходит с противоположной стороны.
      // Ключ светит сверху и со стороны камеры, контровой — из-за спин, чтобы читался силуэт.
      const key = new DirectionalLight('cast-key', new Vector3(-0.3, -0.88, -0.45), scene);
      key.intensity = 0.16;
      key.diffuse = Color3.FromHexString('#ffe3bb');
      key.includedOnlyMeshes = characterMeshes;
      const rim = new DirectionalLight('cast-rim', new Vector3(0.55, -0.3, 0.7), scene);
      rim.intensity = 0.12;
      rim.diffuse = Color3.FromHexString('#9fd8ff');
      rim.includedOnlyMeshes = characterMeshes;

      // Декорации статичны: фиксируем их мировые матрицы, чтобы не считать их каждый кадр.
      const animated = new Set(characterMeshes);
      for (const m of scene.meshes) if (!animated.has(m)) m.freezeWorldMatrix();

      let target = katya.root.position.clone();
      let clock = 0;
      let activeNpcId = '';
      const keys = new Set<string>();
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
        if (hit?.pickedMesh?.metadata?.tag === 'talk') {
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
        clock += delta;
        let dx = 0,
          dz = 0;
        if (keys.has('w') || keys.has('ц') || keys.has('ArrowUp')) dz = -1;
        if (keys.has('s') || keys.has('ы') || keys.has('ArrowDown')) dz = 1;
        if (keys.has('a') || keys.has('ф') || keys.has('ArrowLeft')) dx = -1;
        if (keys.has('d') || keys.has('в') || keys.has('ArrowRight')) dx = 1;
        const lead = active.current === 'katya' ? katya : olya,
          follow = active.current === 'katya' ? olya : katya;
        if (dx || dz) target = lead.root.position.add(new Vector3(dx, 0, dz));
        target.x = Math.max(-5.4, Math.min(8, target.x));
        target.z = Math.max(-1, Math.min(6.2, target.z));
        const dir = target.subtract(lead.root.position);
        dir.y = 0;
        let leadStep = 0;
        let leadDirX = 0;
        let leadDirZ = 0;
        if (dir.length() > 0.08) {
          leadStep = Math.min(3 * delta, dir.length());
          leadDirX = dir.x / dir.length();
          leadDirZ = dir.z / dir.length();
          lead.root.position.addInPlace(dir.normalize().scale(leadStep));
        }
        const followBefore = follow.root.position.clone();
        const ft = lead.root.position.add(new Vector3(0.9, 0, 0.7));
        follow.root.position = Vector3.Lerp(follow.root.position, ft, delta * 3);
        const followStep = Vector3.Distance(followBefore, follow.root.position);

        // Кто сейчас говорит: он жестов не жалеет, остальные слушают.
        const speakerId = speakerRef.current ?? '';
        const talking = npcs.find((n) => n.profile.id === speakerId) ?? npcs[0];
        if (talking && talking.profile.id !== activeNpcId) {
          activeNpcId = talking.profile.id;
          for (const n of npcs) {
            const isActive = n.profile.id === activeNpcId;
            n.rig.setPickTag(isActive ? 'talk' : 'npc');
            n.rig.setPickable(isActive);
          }
          beacon.position.set(
            talking.rig.root.position.x,
            GROUND_Y + 0.12,
            talking.rig.root.position.z
          );
        }
        if (talking) {
          beacon.rotation.y += delta * 0.7;
          const pulse = 1 + 0.05 * Math.sin(clock * 2.2);
          beacon.scaling.set(pulse, 1, pulse);
        }

        const leadHead = lead.headPosition();
        const followHead = follow.headPosition();
        const talkHead = talking ? talking.rig.headPosition() : null;
        const talkDistance = talking
          ? Vector3.Distance(lead.root.position, talking.rig.root.position)
          : Infinity;
        // Голова поворачивается к собеседнику издалека, корпус — только вблизи:
        // иначе героиня всё время стояла бы спиной к камере.
        const lookAtNpc = talkDistance < 8 ? talkHead : null;
        const faceNpc = talkDistance < 3.2;
        // Идущая героиня смотрит по ходу, стоящая — на собеседника.
        const leadFacing =
          leadStep > 0.0005
            ? Math.atan2(leadDirX, leadDirZ)
            : faceNpc
              ? angleTo(lead.root.position, talking!.rig.root.position)
              : lead.facing;
        lead.update(delta, {
          distance: leadStep,
          facing: leadFacing,
          lookAt: lookAtNpc,
          talk: speakerId === (active.current === 'katya' ? 'katya' : 'olya') ? 1 : 0,
        });
        follow.update(delta, {
          distance: followStep,
          facing: followStep > 0.0005 ? angleTo(followBefore, follow.root.position) : leadFacing,
          lookAt: talkHead ?? leadHead,
          talk: speakerId === (active.current === 'katya' ? 'olya' : 'katya') ? 1 : 0,
        });

        for (const n of npcs) {
          const d = Vector3.Distance(n.rig.root.position, lead.root.position);
          n.rig.update(delta, {
            distance: 0,
            facing: d < 3.6 ? angleTo(n.rig.root.position, lead.root.position) : n.profile.facing,
            lookAt: d < 7 ? leadHead : null,
            talk: n.profile.id === speakerId ? 1 : 0,
          });
        }

        for (const w of walkers) {
          w.dist += w.speed * delta;
          const p = pointAt(w.info, w.dist);
          const before = w.rig.root.position.clone();
          w.rig.root.position.set(p.x, GROUND_Y, p.z);
          w.rig.update(delta, {
            distance: Vector3.Distance(before, w.rig.root.position),
            facing: p.dir,
            talk: 0,
          });
        }

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
    } catch (error) {
      // Текстовый режим — рабочий путь, поэтому падение renderer-а не должно ронять игру.
      console.error('[world] 3D-сцена недоступна', error);
      engine?.dispose();
      setFailed(true);
    }
    return cleanup;
  }, [place, low]);
  if (failed)
    return (
      <div className="world-fallback">
        <p>
          {locale === 'ru'
            ? '3D недоступно на этом устройстве. История полностью доступна через кнопки ниже.'
            : '3D is unavailable. The full story remains accessible using the buttons below.'}
        </p>
      </div>
    );
  return (
    <>
      <canvas
        ref={canvas}
        aria-label={
          locale === 'ru'
            ? '3D-локация. Нажмите на землю для перемещения.'
            : '3D scene. Tap the ground to move.'
        }
        tabIndex={0}
      />
      {cast.length > 0 && (
        <div className="world-cast">
          {cast.map((p) => (
            <span key={p.id} className={p.id === speaker ? 'speaking' : undefined}>
              <b>{locale === 'ru' ? p.name_ru : p.name_en}</b>
              {locale === 'ru' ? p.role_ru : p.role_en}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
