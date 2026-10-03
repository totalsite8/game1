/**
 * Процедурный человекоподобный персонаж.
 *
 * Модуль ничего не знает о сцене: он получает профиль внешности (LookProfile)
 * и собирает из примитивов костную схему, тело, лицо, одежду и реквизит,
 * а затем анимирует её — дыхание, перенос веса, моргание, взгляд,
 * цикл шага с контр-ротацией корпуса и жестикуляцию во время реплик.
 *
 * Пропорции заданы долями роста (7.5 голов на рост), поэтому один профиль
 * одинаково читается при любой высоте персонажа и любом качестве рендера.
 * Оси: X — вправо, Y — вверх, Z — вперёд (лицом персонажа).
 */
import { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateCapsule } from '@babylonjs/core/Meshes/Builders/capsuleBuilder';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder';
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
import type { LookProfile } from '../content/characters';

/** Тип поверхности: влияет на блик материала. */
export type Surface = 'skin' | 'cloth' | 'hair' | 'metal' | 'rubber' | 'paper' | 'glow';
/** 2 — героини (максимум деталей), 1 — NPC, 0 — фон и низкое разрешение. */
export type Detail = 0 | 1 | 2;

/** Костная схема персонажа. */
interface Joints {
  root: TransformNode;
  pelvis: TransformNode;
  waist: TransformNode;
  chest: TransformNode;
  neck: TransformNode;
  head: TransformNode;
  shoulderP: TransformNode;
  shoulderN: TransformNode;
  elbowP: TransformNode;
  elbowN: TransformNode;
  wristP: TransformNode;
  wristN: TransformNode;
  hipP: TransformNode;
  hipN: TransformNode;
  kneeP: TransformNode;
  kneeN: TransformNode;
  ankleP: TransformNode;
  ankleN: TransformNode;
}

export interface FrameState {
  /** Пройденная за кадр дистанция в метрах: по ней считается фаза шага, чтобы стопы не скользили. */
  distance: number;
  /** Поворот корпуса, к которому нужно плавно повернуться (радианы). */
  facing?: number;
  /** Точка, на которую персонаж смотрит. null — смотрит прямо. */
  lookAt?: Vector3 | null;
  /** Энергия речи 0..1: включает кивки и жесты руками. */
  talk?: number;
}

function wrap(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}
function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Общая библиотека материалов: цвета и поверхности переиспользуются между персонажами. */
export class Palette {
  private readonly cache = new Map<string, StandardMaterial>();
  constructor(private readonly scene: Scene) {}

  get(hex: string, surface: Surface = 'cloth'): StandardMaterial {
    const key = `${hex}|${surface}`;
    const found = this.cache.get(key);
    if (found) return found;
    const m = new StandardMaterial(key, this.scene);
    const c = Color3.FromHexString(hex);
    m.diffuseColor = c;
    m.specularColor = Color3.Black();
    if (surface === 'skin') {
      // Кожа почти не даёт зеркального блика, но мягко отвечает на свет.
      m.specularColor = new Color3(0.05, 0.045, 0.042);
      m.specularPower = 26;
    } else if (surface === 'hair') {
      m.specularColor = new Color3(0.2, 0.19, 0.18);
      m.specularPower = 44;
    } else if (surface === 'cloth') {
      m.specularColor = new Color3(0.035, 0.035, 0.035);
      m.specularPower = 12;
    } else if (surface === 'metal') {
      m.specularColor = new Color3(0.5, 0.5, 0.53);
      m.specularPower = 64;
    } else if (surface === 'rubber') {
      m.specularColor = new Color3(0.09, 0.09, 0.09);
      m.specularPower = 16;
    } else if (surface === 'glow') {
      m.emissiveColor = c.scale(0.55);
    }
    this.cache.set(key, m);
    return m;
  }

  dispose() {
    for (const m of this.cache.values()) m.dispose();
    this.cache.clear();
  }
}

/** Мягкая контактная тень: одна текстура и один материал на всю сцену. */
const shadowCache = new WeakMap<Scene, StandardMaterial>();
function shadowMaterial(scene: Scene): StandardMaterial {
  const found = shadowCache.get(scene);
  if (found) return found;
  const tex = new DynamicTexture('contact-shadow', { width: 128, height: 128 }, scene, false);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.62)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.4)');
  g.addColorStop(0.78, 'rgba(0,0,0,0.14)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  tex.update(false);
  tex.hasAlpha = true;
  const mat = new StandardMaterial('contact-shadow', scene);
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.emissiveColor = Color3.Black();
  mat.disableLighting = true;
  mat.opacityTexture = tex;
  mat.backFaceCulling = false;
  shadowCache.set(scene, mat);
  return mat;
}

interface CapsuleOpts {
  /** Длина цилиндрической части (без колпачков) в метрах. */
  len: number;
  rTop: number;
  rBot: number;
  hex: string;
  surface?: Surface;
  y?: number;
  x?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sz?: number;
}
interface BlobOpts {
  d: number;
  hex: string;
  surface?: Surface;
  y?: number;
  x?: number;
  z?: number;
  sx?: number;
  sy?: number;
  sz?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  seg?: number;
  slice?: number;
}
interface BoxOpts {
  w: number;
  h: number;
  d: number;
  hex: string;
  surface?: Surface;
  y?: number;
  x?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}
interface ConeOpts {
  dTop: number;
  dBot: number;
  h: number;
  hex: string;
  surface?: Surface;
  y?: number;
  x?: number;
  z?: number;
  rx?: number;
  rz?: number;
  sx?: number;
  sz?: number;
  tess?: number;
}

/** Базовые позы: как персонаж стоит, когда не идёт и не говорит. */
const IDLE_POSE: Record<
  LookProfile['posture'],
  {
    /** Наклон руки вперёд/назад. */
    shoulderX: number;
    /** Разведение плеча: плюс — наружу, минус — внутрь. */
    shoulderZ: number;
    /** Сгиб локтя. */
    elbow: number;
    /** Сведение предплечья к центру (для сомкнутых рук). */
    elbowZ: number;
    /** Разворот плеча. */
    twist: number;
    /** Наклон корпуса. */
    lean: number;
  }
> = {
  // Расслабленная: руки свободно вдоль корпуса.
  relaxed: {
    shoulderX: 0.05,
    shoulderZ: 0.07,
    elbow: -0.2,
    elbowZ: 0.04,
    twist: 0.05,
    lean: 0.015,
  },
  // Закрытая: руки сомкнуты перед собой, корпус собран.
  guarded: { shoulderX: 0.28, shoulderZ: -0.03, elbow: -0.95, elbowZ: 0.42, twist: 0, lean: -0.01 },
  // Прямая: плечи расправлены.
  upright: {
    shoulderX: 0.03,
    shoulderZ: 0.08,
    elbow: -0.24,
    elbowZ: 0.05,
    twist: 0.04,
    lean: -0.02,
  },
  // Спокойная: руки чуть назад, движения скупые.
  stoic: { shoulderX: -0.08, shoulderZ: 0.09, elbow: -0.38, elbowZ: 0.05, twist: 0.1, lean: 0.03 },
};

export class Humanoid {
  readonly root: TransformNode;
  readonly height: number;
  readonly meshes: AbstractMesh[] = [];
  private readonly j: Joints;
  private readonly look: LookProfile;
  private readonly h: number;
  private readonly detail: Detail;
  private readonly basePelvisY: number;
  private readonly eyeP: TransformNode;
  private readonly eyeN: TransformNode;
  private readonly lidP: Mesh;
  private readonly lidN: Mesh;
  private readonly lidBase: number;
  private readonly lidDrop: number;
  private pose = IDLE_POSE.upright;
  /** Личное время: у каждого персонажа свой ритм дыхания и жестов. */
  private t = Math.random() * 60;
  private phase = Math.random() * Math.PI * 2;
  private amp = 0;
  private gesture = 0;
  private yaw: number;
  private headYaw = 0;
  private headPitch = 0;
  private blink = 0;
  private blinkIn = 1.5 + Math.random() * 4;
  private readonly shadow: Mesh | null;

  constructor(
    name: string,
    look: LookProfile,
    palette: Palette,
    scene: Scene,
    opts: { detail: Detail; facing?: number; contactShadow?: boolean } = { detail: 1 }
  ) {
    this.look = look;
    this.detail = opts.detail;
    this.h = look.height;
    this.height = look.height;
    this.pose = IDLE_POSE[look.posture];
    this.yaw = opts.facing ?? 0;

    const H = this.h;
    const b = look.build;
    const low = this.detail === 0;
    const rich = this.detail === 2;
    const seg = low ? 6 : rich ? 11 : 9;
    const sphSeg = low ? 6 : 10;

    const root = new TransformNode(`${name}:root`, scene);
    root.rotation.y = this.yaw;
    this.root = root;

    const node = (n: string, parent: TransformNode, y = 0, x = 0, z = 0) => {
      const t = new TransformNode(`${name}:${n}`, scene);
      t.parent = parent;
      t.position.set(x, y, z);
      return t;
    };
    const push = <T extends AbstractMesh>(m: T): T => {
      m.isPickable = false;
      m.receiveShadows = false;
      this.meshes.push(m);
      return m;
    };
    const capsule = (parent: TransformNode, n: string, o: CapsuleOpts) => {
      const height = Math.max(o.len + (o.rTop + o.rBot) * 0.9, (o.rTop + o.rBot) * 1.25);
      const m = CreateCapsule(
        `${name}:${n}`,
        {
          height,
          radiusTop: o.rTop,
          radiusBottom: o.rBot,
          tessellation: seg,
          capSubdivisions: low ? 2 : 3,
        },
        scene
      );
      m.parent = parent;
      m.material = palette.get(o.hex, o.surface ?? 'cloth');
      m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
      if (o.sx || o.sz) m.scaling.set(o.sx ?? 1, 1, o.sz ?? 1);
      if (o.rx || o.ry || o.rz) m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
      return push(m);
    };
    const blob = (parent: TransformNode, n: string, o: BlobOpts) => {
      const m = CreateSphere(
        `${name}:${n}`,
        { diameter: o.d, segments: o.seg ?? sphSeg, slice: o.slice },
        scene
      );
      m.parent = parent;
      m.material = palette.get(o.hex, o.surface ?? 'cloth');
      m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
      m.scaling.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1);
      if (o.rx || o.ry || o.rz) m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
      return push(m);
    };
    const box = (parent: TransformNode, n: string, o: BoxOpts) => {
      const m = CreateBox(`${name}:${n}`, { width: o.w, height: o.h, depth: o.d }, scene);
      m.parent = parent;
      m.material = palette.get(o.hex, o.surface ?? 'cloth');
      m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
      if (o.rx || o.ry || o.rz) m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
      return push(m);
    };
    const cone = (parent: TransformNode, n: string, o: ConeOpts) => {
      const m = CreateCylinder(
        `${name}:${n}`,
        {
          diameterTop: o.dTop,
          diameterBottom: o.dBot,
          height: o.h,
          tessellation: o.tess ?? (low ? 8 : 14),
        },
        scene
      );
      m.parent = parent;
      m.material = palette.get(o.hex, o.surface ?? 'cloth');
      m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
      if (o.sx || o.sz) m.scaling.set(o.sx ?? 1, 1, o.sz ?? 1);
      if (o.rx || o.rz) m.rotation.set(o.rx ?? 0, 0, o.rz ?? 0);
      return push(m);
    };

    // ── Костная схема ──────────────────────────────────────────────────────
    const pelvis = node('pelvis', root, 0.505 * H);
    const waist = node('waist', pelvis, 0.115 * H);
    const chest = node('chest', waist, 0.1 * H);
    const neck = node('neck', chest, 0.11 * H);
    const head = node('head', neck, 0.04 * H);
    const shoulderP = node('shoulderP', chest, 0.075 * H, 0.1 * H * b);
    const shoulderN = node('shoulderN', chest, 0.075 * H, -0.1 * H * b);
    const elbowP = node('elbowP', shoulderP, -0.185 * H);
    const elbowN = node('elbowN', shoulderN, -0.185 * H);
    const wristP = node('wristP', elbowP, -0.145 * H);
    const wristN = node('wristN', elbowN, -0.145 * H);
    const hipP = node('hipP', pelvis, -0.01 * H, 0.058 * H * b);
    const hipN = node('hipN', pelvis, -0.01 * H, -0.058 * H * b);
    const kneeP = node('kneeP', hipP, -0.235 * H);
    const kneeN = node('kneeN', hipN, -0.235 * H);
    const ankleP = node('ankleP', kneeP, -0.225 * H);
    const ankleN = node('ankleN', kneeN, -0.225 * H);
    this.j = {
      root,
      pelvis,
      waist,
      chest,
      neck,
      head,
      shoulderP,
      shoulderN,
      elbowP,
      elbowN,
      wristP,
      wristN,
      hipP,
      hipN,
      kneeP,
      kneeN,
      ankleP,
      ankleN,
    };
    this.basePelvisY = pelvis.position.y;

    const skin = look.skin;
    const top = look.top;
    const bottom = look.bottom;
    const bare = look.sleeve === 'none';
    const armHex = (upper: boolean) =>
      bare ? skin : look.sleeve === 'long' ? top : upper ? top : skin;
    const armSurface = (upper: boolean): Surface => (armHex(upper) === skin ? 'skin' : 'cloth');
    const torsoHex = bare ? skin : top;
    const torsoSurface: Surface = bare ? 'skin' : 'cloth';

    // ── Таз и корпус ───────────────────────────────────────────────────────
    if (look.bottomCut === 'skirt') {
      capsule(pelvis, 'pelvis', {
        len: 0.015 * H,
        rTop: 0.09 * H * b,
        rBot: 0.082 * H * b,
        hex: skin,
        surface: 'skin',
        sx: 1.05,
        sz: 0.75,
      });
      cone(pelvis, 'skirt', {
        dTop: 0.19 * H * b,
        dBot: 0.31 * H * b,
        h: 0.3 * H,
        hex: bottom,
        y: -0.1 * H,
      });
    } else {
      capsule(pelvis, 'pelvis', {
        len: 0.015 * H,
        rTop: 0.09 * H * b,
        rBot: 0.082 * H * b,
        hex: bottom,
        sx: 1.05,
        sz: 0.75,
      });
    }
    // Рубашка: от талии до плеч, с расширением в груди.
    capsule(waist, 'shirt', {
      len: 0.086 * H,
      rTop: 0.088 * H * b,
      rBot: 0.078 * H * b,
      hex: torsoHex,
      surface: torsoSurface,
      y: 0.0975 * H,
      sz: 0.72,
    });
    if (look.bust && !low) {
      blob(chest, 'bust', {
        d: 0.085 * H * b,
        hex: torsoHex,
        surface: torsoSurface,
        y: -0.005 * H,
        z: 0.028 * H,
        sx: 1.6,
        sy: 0.9,
        sz: 0.7,
      });
    }
    if (!low) {
      cone(waist, 'hem', {
        dTop: 0.178 * H * b,
        dBot: 0.174 * H * b,
        h: 0.024 * H,
        hex: torsoHex,
        surface: torsoSurface,
        y: -0.01 * H,
        sx: 1.05,
      });
      cone(neck, 'collar', {
        dTop: 0.065 * H,
        dBot: 0.085 * H,
        h: 0.03 * H,
        hex: torsoHex,
        surface: torsoSurface,
        y: -0.008 * H,
      });
    }
    // Основание шеи и шея: сглаживают переход от корпуса к голове.
    blob(chest, 'trapezius', {
      d: 0.09 * H * b,
      hex: skin,
      surface: 'skin',
      y: 0.058 * H,
      sx: 1.2,
      sy: 0.62,
      sz: 0.9,
    });
    cone(neck, 'neck', {
      dTop: 0.062 * H,
      dBot: 0.072 * H,
      h: 0.08 * H,
      hex: skin,
      surface: 'skin',
      y: -0.005 * H,
    });

    // ── Голова ─────────────────────────────────────────────────────────────
    const skullY = 0.058 * H;
    blob(head, 'skull', {
      d: 0.135 * H,
      hex: skin,
      surface: 'skin',
      y: skullY,
      z: 0.004 * H,
      sx: 0.65,
      sz: 0.83,
    });
    blob(head, 'jaw', {
      d: 0.078 * H,
      hex: skin,
      surface: 'skin',
      y: skullY - 0.038 * H,
      z: 0.014 * H,
      sx: 0.86,
      sy: 0.72,
      sz: 0.95,
    });
    if (rich) {
      blob(head, 'chin', {
        d: 0.044 * H,
        hex: skin,
        surface: 'skin',
        y: skullY - 0.062 * H,
        z: 0.034 * H,
        sx: 0.95,
        sy: 0.75,
        sz: 0.85,
      });
      for (const side of [1, -1])
        blob(head, `cheek${side > 0 ? 'P' : 'N'}`, {
          d: 0.034 * H,
          hex: skin,
          surface: 'skin',
          x: side * 0.026 * H,
          y: skullY - 0.022 * H,
          z: 0.04 * H,
          sy: 0.8,
          sz: 0.7,
        });
    }
    box(head, 'nose-bridge', {
      w: 0.016 * H,
      h: 0.04 * H,
      d: 0.02 * H,
      hex: skin,
      surface: 'skin',
      y: skullY - 0.008 * H,
      z: 0.055 * H,
    });
    if (!low)
      blob(head, 'nose-tip', {
        d: 0.023 * H,
        hex: skin,
        surface: 'skin',
        y: skullY - 0.028 * H,
        z: 0.062 * H,
        sx: 1.1,
        sy: 0.85,
        sz: 0.9,
      });
    if (rich)
      for (const side of [1, -1])
        blob(head, `nostril${side > 0 ? 'P' : 'N'}`, {
          d: 0.013 * H,
          hex: skin,
          surface: 'skin',
          x: side * 0.012 * H,
          y: skullY - 0.034 * H,
          z: 0.056 * H,
        });
    box(head, 'lips', {
      w: 0.034 * H,
      h: 0.009 * H,
      d: 0.011 * H,
      hex: '#b4695f',
      surface: 'skin',
      y: skullY - 0.044 * H,
      z: 0.052 * H,
    });
    if (!low) {
      blob(head, 'lip-lower', {
        d: 0.03 * H,
        hex: '#ad6157',
        surface: 'skin',
        y: skullY - 0.052 * H,
        z: 0.05 * H,
        sy: 0.45,
        sz: 0.6,
      });
      for (const side of [1, -1])
        blob(head, `ear${side > 0 ? 'P' : 'N'}`, {
          d: 0.032 * H,
          hex: skin,
          surface: 'skin',
          x: side * 0.044 * H,
          y: skullY - 0.004 * H,
          z: -0.004 * H,
          sx: 0.35,
          sy: 1.05,
          sz: 0.62,
        });
    }

    // ── Глаза ──────────────────────────────────────────────────────────────
    const eyeY = skullY - 0.004 * H;
    const eyeZ = 0.046 * H;
    const eyeX = 0.02 * H;
    const buildEye = (side: 1 | -1) => {
      const g = new TransformNode(`${name}:eye${side > 0 ? 'P' : 'N'}`, scene);
      g.parent = head;
      g.position.set(side * eyeX, eyeY, eyeZ);
      blob(g, 'sclera', {
        d: 0.022 * H,
        hex: '#f4f1ea',
        surface: 'skin',
        z: 0.006 * H,
        sy: 0.62,
        sz: 0.55,
      });
      blob(g, 'iris', { d: 0.0115 * H, hex: look.eyes, surface: 'skin', z: 0.0105 * H, sz: 0.5 });
      blob(g, 'pupil', { d: 0.0055 * H, hex: '#14100e', surface: 'paper', z: 0.0125 * H, sz: 0.4 });
      if (rich)
        blob(g, 'glint', {
          d: 0.0036 * H,
          hex: '#ffffff',
          surface: 'glow',
          x: -side * 0.0028 * H,
          y: 0.0022 * H,
          z: 0.0135 * H,
        });
      return g;
    };
    this.eyeP = buildEye(1);
    this.eyeN = buildEye(-1);
    this.lidBase = eyeY + 0.0055 * H;
    this.lidDrop = 0.011 * H;
    const lid = (side: 1 | -1) =>
      blob(head, `lid${side > 0 ? 'P' : 'N'}`, {
        d: 0.024 * H,
        hex: skin,
        surface: 'skin',
        x: side * eyeX,
        y: this.lidBase,
        z: eyeZ + 0.004 * H,
        sx: 1.02,
        sy: 0.42,
        sz: 0.6,
      });
    this.lidP = lid(1);
    this.lidN = lid(-1);
    for (const side of [1, -1])
      box(head, `brow${side > 0 ? 'P' : 'N'}`, {
        w: 0.026 * H,
        h: 0.0055 * H,
        d: 0.01 * H,
        hex: look.hair,
        surface: 'hair',
        x: side * eyeX,
        y: eyeY + 0.017 * H,
        z: eyeZ + 0.01 * H,
        rz: side * -0.14,
      });

    // ── Причёска ───────────────────────────────────────────────────────────
    // slice — какая доля сферы от макушки сохраняется: чем меньше, тем выше линия роста волос.
    // Граница считается от центра черепа (0.928H): 0.39 даёт линию ~0.955H, то есть лоб открыт.
    const slices: Record<LookProfile['hairStyle'], number> = {
      ponytail: 0.44,
      low_bun: 0.42,
      bob: 0.46,
      wavy_long: 0.44,
      short: 0.39,
      short_grey: 0.36,
    };
    blob(head, 'hair', {
      d: 0.144 * H,
      hex: look.hair,
      surface: 'hair',
      slice: slices[look.hairStyle],
      y: skullY + 0.003 * H,
      z: 0.002 * H,
      sx: 0.68,
      sz: 0.87,
    });
    const hair = look.hairStyle;
    // Затылок: волосы закрывают череп сзади до шеи, лицо остаётся открытым.
    if (hair !== 'bob') {
      const shortBack = hair === 'short' || hair === 'short_grey';
      blob(head, 'hair-back', {
        d: (shortBack ? 0.088 : 0.1) * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - (shortBack ? 0.026 : 0.012) * H,
        z: -0.04 * H,
        sx: 1.05,
        sy: shortBack ? 1.15 : 1.2,
        sz: 0.82,
      });
    }
    if (hair === 'ponytail') {
      blob(head, 'hair-tie', {
        d: 0.048 * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - 0.018 * H,
        z: -0.058 * H,
        sx: 1.2,
      });
      capsule(head, 'ponytail', {
        len: 0.175 * H,
        rTop: 0.034 * H,
        rBot: 0.016 * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - 0.05 * H,
        z: -0.085 * H,
        rx: 0.72,
      });
      if (!low)
        box(head, 'fringe', {
          w: 0.07 * H,
          h: 0.012 * H,
          d: 0.05 * H,
          hex: look.hair,
          surface: 'hair',
          x: 0.008 * H,
          y: skullY + 0.05 * H,
          z: 0.014 * H,
          rz: -0.16,
        });
    } else if (hair === 'low_bun') {
      blob(head, 'bun', {
        d: 0.058 * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - 0.04 * H,
        z: -0.078 * H,
        sx: 1.15,
        sy: 0.92,
        sz: 0.95,
      });
      if (!low)
        for (const side of [1, -1])
          blob(head, `tuck${side > 0 ? 'P' : 'N'}`, {
            d: 0.032 * H,
            hex: look.hair,
            surface: 'hair',
            x: side * 0.04 * H,
            y: skullY - 0.012 * H,
            z: -0.028 * H,
            sx: 0.5,
            sy: 1.2,
          });
    } else if (hair === 'bob') {
      blob(head, 'hair-back', {
        d: 0.092 * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - 0.032 * H,
        z: -0.04 * H,
        sx: 1.05,
        sy: 1.15,
        sz: 0.85,
      });
      for (const side of [1, -1])
        blob(head, `hair-side${side > 0 ? 'P' : 'N'}`, {
          d: 0.086 * H,
          hex: look.hair,
          surface: 'hair',
          x: side * 0.042 * H,
          y: skullY - 0.028 * H,
          z: -0.004 * H,
          sx: 0.42,
          sy: 1.45,
        });
    } else if (hair === 'wavy_long') {
      blob(head, 'hair-mass', {
        d: 0.1 * H,
        hex: look.hair,
        surface: 'hair',
        y: skullY - 0.07 * H,
        z: -0.045 * H,
        sx: 1.15,
        sy: 1.85,
        sz: 0.9,
      });
      if (!low)
        for (const side of [1, -1])
          capsule(head, `strand${side > 0 ? 'P' : 'N'}`, {
            len: 0.125 * H,
            rTop: 0.028 * H,
            rBot: 0.022 * H,
            hex: look.hair,
            surface: 'hair',
            x: side * 0.045 * H,
            y: skullY - 0.075 * H,
            z: 0.014 * H,
            rz: side * 0.07,
          });
    } else if (hair === 'short') {
      if (!low)
        for (const [i, dx] of [-0.022, 0.004, 0.026].entries())
          box(head, `fringe${i}`, {
            w: 0.028 * H,
            h: 0.014 * H,
            d: 0.032 * H,
            hex: look.hair,
            surface: 'hair',
            x: dx * H,
            y: skullY + 0.042 * H,
            z: 0.03 * H,
            rz: dx * 3,
          });
    } else if (hair === 'short_grey') {
      if (!low)
        for (const side of [1, -1])
          blob(head, `temple${side > 0 ? 'P' : 'N'}`, {
            d: 0.03 * H,
            hex: look.hair,
            surface: 'hair',
            x: side * 0.04 * H,
            y: skullY - 0.008 * H,
            z: 0.014 * H,
            sx: 0.55,
            sy: 0.85,
          });
    }

    // ── Руки ───────────────────────────────────────────────────────────────
    const arm = (
      shoulder: TransformNode,
      elbow: TransformNode,
      wrist: TransformNode,
      side: 1 | -1
    ) => {
      const tag = side > 0 ? 'P' : 'N';
      blob(shoulder, `deltoid${tag}`, {
        d: 0.066 * H,
        hex: bare ? skin : top,
        surface: bare ? 'skin' : 'cloth',
        sx: 1.05,
        sy: 0.95,
      });
      capsule(shoulder, `upper-arm${tag}`, {
        len: 0.135 * H,
        rTop: 0.03 * H,
        rBot: 0.026 * H,
        hex: armHex(true),
        surface: armSurface(true),
        y: -0.0925 * H,
      });
      if (!low)
        blob(elbow, `elbow${tag}`, {
          d: 0.05 * H,
          hex: armHex(true),
          surface: armSurface(true),
          sy: 1.15,
        });
      capsule(elbow, `forearm${tag}`, {
        len: 0.107 * H,
        rTop: 0.024 * H,
        rBot: 0.018 * H,
        hex: armHex(false),
        surface: armSurface(false),
        y: -0.0725 * H,
      });
      blob(wrist, `palm${tag}`, {
        d: 0.048 * H,
        hex: skin,
        surface: 'skin',
        y: -0.042 * H,
        sy: 1.55,
        sz: 0.6,
      });
      if (!low)
        box(wrist, `fingers${tag}`, {
          w: 0.032 * H,
          h: 0.042 * H,
          d: 0.018 * H,
          hex: skin,
          surface: 'skin',
          y: -0.084 * H,
          z: 0.002 * H,
        });
      if (rich)
        box(wrist, `thumb${tag}`, {
          w: 0.013 * H,
          h: 0.032 * H,
          d: 0.013 * H,
          hex: skin,
          surface: 'skin',
          x: side * 0.02 * H,
          y: -0.038 * H,
          z: 0.012 * H,
          rz: side * 0.5,
        });
    };
    arm(shoulderP, elbowP, wristP, 1);
    arm(shoulderN, elbowN, wristN, -1);

    // ── Ноги ───────────────────────────────────────────────────────────────
    const leg = (hip: TransformNode, knee: TransformNode, ankle: TransformNode, side: 1 | -1) => {
      const tag = side > 0 ? 'P' : 'N';
      if (look.bottomCut === 'shorts') {
        capsule(hip, `shorts${tag}`, {
          len: 0.056 * H,
          rTop: 0.058 * H * b,
          rBot: 0.052 * H * b,
          hex: bottom,
          y: -0.0775 * H,
          sx: 1.05,
        });
        capsule(hip, `thigh${tag}`, {
          len: 0.005 * H,
          rTop: 0.046 * H * b,
          rBot: 0.04 * H * b,
          hex: skin,
          surface: 'skin',
          y: -0.195 * H,
        });
        capsule(knee, `calf${tag}`, {
          len: 0.165 * H,
          rTop: 0.04 * H * b,
          rBot: 0.026 * H * b,
          hex: skin,
          surface: 'skin',
          y: -0.1125 * H,
        });
      } else if (look.bottomCut === 'skirt') {
        capsule(hip, `thigh${tag}`, {
          len: 0.15 * H,
          rTop: 0.052 * H * b,
          rBot: 0.042 * H * b,
          hex: skin,
          surface: 'skin',
          y: -0.1175 * H,
        });
        capsule(knee, `calf${tag}`, {
          len: 0.165 * H,
          rTop: 0.04 * H * b,
          rBot: 0.026 * H * b,
          hex: skin,
          surface: 'skin',
          y: -0.1125 * H,
        });
      } else {
        capsule(hip, `thigh${tag}`, {
          len: 0.15 * H,
          rTop: 0.052 * H * b,
          rBot: 0.042 * H * b,
          hex: bottom,
          y: -0.1175 * H,
        });
        capsule(knee, `calf${tag}`, {
          len: 0.125 * H,
          rTop: 0.04 * H * b,
          rBot: 0.028 * H * b,
          hex: bottom,
          y: -0.1 * H,
        });
        capsule(ankle, `ankle${tag}`, {
          len: 0.02 * H,
          rTop: 0.024 * H * b,
          rBot: 0.022 * H * b,
          hex: skin,
          surface: 'skin',
          y: 0.02 * H,
        });
      }
      if (low) {
        box(ankle, `shoe${tag}`, {
          w: 0.075 * H * b,
          h: 0.045 * H,
          d: 0.11 * H,
          hex: look.shoes,
          surface: 'rubber',
          y: 0.024 * H,
          z: 0.02 * H,
        });
      } else {
        box(ankle, `shoe${tag}`, {
          w: 0.075 * H * b,
          h: 0.045 * H,
          d: 0.11 * H,
          hex: look.shoes,
          surface: 'rubber',
          y: 0.024 * H,
          z: 0.02 * H,
        });
        blob(ankle, `toe${tag}`, {
          d: 0.072 * H,
          hex: look.shoes,
          surface: 'rubber',
          y: 0.02 * H,
          z: 0.075 * H,
          sx: 1.05,
          sy: 0.62,
        });
        if (rich)
          box(ankle, `sole${tag}`, {
            w: 0.08 * H * b,
            h: 0.014 * H,
            d: 0.125 * H,
            hex: '#1b1b1d',
            surface: 'rubber',
            y: 0.007 * H,
            z: 0.025 * H,
          });
      }
    };
    leg(hipP, kneeP, ankleP, 1);
    leg(hipN, kneeN, ankleN, -1);

    // ── Одежда поверх и реквизит ───────────────────────────────────────────
    if (look.lanyard && !low) {
      for (const side of [1, -1])
        box(chest, `lanyard${side > 0 ? 'P' : 'N'}`, {
          w: 0.009 * H,
          h: 0.15 * H,
          d: 0.007 * H,
          hex: '#2b3a52',
          x: side * 0.035 * H,
          y: -0.07 * H,
          z: 0.05 * H,
          rz: side * 0.26,
        });
      box(chest, 'badge', {
        w: 0.05 * H,
        h: 0.07 * H,
        d: 0.006 * H,
        hex: '#e8eef2',
        surface: 'paper',
        y: 0.005 * H,
        z: 0.062 * H,
      });
    }
    if (look.apron && !low) {
      box(chest, 'apron-bib', {
        w: 0.14 * H,
        h: 0.16 * H,
        d: 0.02 * H,
        hex: look.apron,
        y: -0.05 * H,
        z: 0.062 * H,
      });
      box(waist, 'apron-skirt', {
        w: 0.19 * H,
        h: 0.24 * H,
        d: 0.02 * H,
        hex: look.apron,
        y: -0.16 * H,
        z: 0.058 * H,
      });
    }
    if (look.backpack && !low) {
      box(chest, 'backpack', {
        w: 0.17 * H,
        h: 0.24 * H,
        d: 0.1 * H,
        hex: '#4a4f57',
        y: -0.02 * H,
        z: -0.1 * H,
      });
      for (const side of [1, -1])
        box(chest, `strap${side > 0 ? 'P' : 'N'}`, {
          w: 0.022 * H,
          h: 0.2 * H,
          d: 0.012 * H,
          hex: '#3b4046',
          x: side * 0.055 * H,
          y: -0.02 * H,
          z: 0.05 * H,
        });
    }
    if (look.glasses && !low) {
      for (const side of [1, -1]) {
        const t = CreateTorus(
          `${name}:lens${side > 0 ? 'P' : 'N'}`,
          { diameter: 0.03 * H, thickness: 0.005 * H, tessellation: 14 },
          scene
        );
        t.parent = head;
        t.position.set(side * eyeX, eyeY, eyeZ + 0.006 * H);
        t.rotation.x = Math.PI / 2;
        t.material = palette.get('#1b1b1f', 'metal');
        push(t);
      }
      box(head, 'bridge', {
        w: 0.016 * H,
        h: 0.004 * H,
        d: 0.004 * H,
        hex: '#1b1b1f',
        surface: 'metal',
        y: eyeY,
        z: eyeZ + 0.006 * H,
      });
    }
    if (look.cap && !low) {
      cone(head, 'cap', {
        dTop: 0.02 * H,
        dBot: 0.155 * H,
        h: 0.065 * H,
        hex: look.cap,
        y: skullY + 0.07 * H,
      });
      box(head, 'cap-brim', {
        w: 0.13 * H,
        h: 0.012 * H,
        d: 0.1 * H,
        hex: look.cap,
        y: skullY + 0.042 * H,
        z: 0.075 * H,
      });
    }
    if (look.conicalHat) {
      cone(head, 'conical-hat', {
        dTop: 0.03 * H,
        dBot: 0.44 * H,
        h: 0.13 * H,
        hex: '#d8c58f',
        y: skullY + 0.08 * H,
        tess: low ? 10 : 18,
      });
    }

    const prop = look.prop;
    const propHex = look.propColor;
    if (prop === 'camera') {
      box(wristP, 'camera-body', {
        w: 0.075 * H,
        h: 0.055 * H,
        d: 0.042 * H,
        hex: propHex,
        surface: 'rubber',
        y: -0.055 * H,
        z: 0.03 * H,
      });
      cone(wristP, 'camera-lens', {
        dTop: 0.036 * H,
        dBot: 0.036 * H,
        h: 0.035 * H,
        hex: '#15161a',
        surface: 'metal',
        y: -0.055 * H,
        z: 0.065 * H,
        rx: Math.PI / 2,
      });
      if (!low)
        box(chest, 'camera-strap', {
          w: 0.012 * H,
          h: 0.22 * H,
          d: 0.008 * H,
          hex: '#33302c',
          x: 0.06 * H * b,
          y: -0.09 * H,
          z: 0.045 * H,
          rz: 0.22,
        });
    } else if (prop === 'tote') {
      box(chest, 'tote-bag', {
        w: 0.13 * H,
        h: 0.15 * H,
        d: 0.06 * H,
        hex: propHex,
        x: -0.13 * H * b,
        y: -0.15 * H,
        z: 0.01 * H,
        rz: -0.08,
      });
      box(chest, 'tote-strap', {
        w: 0.022 * H,
        h: 0.24 * H,
        d: 0.012 * H,
        hex: propHex,
        x: -0.1 * H * b,
        y: -0.06 * H,
        z: 0.02 * H,
        rz: -0.18,
      });
    } else if (prop === 'phone') {
      box(wristP, 'phone', {
        w: 0.032 * H,
        h: 0.062 * H,
        d: 0.008 * H,
        hex: propHex,
        surface: 'metal',
        y: -0.05 * H,
        z: 0.028 * H,
        rx: -0.5,
      });
      if (!low)
        box(wristP, 'phone-screen', {
          w: 0.028 * H,
          h: 0.056 * H,
          d: 0.003 * H,
          hex: '#9fd0e8',
          surface: 'glow',
          y: -0.05 * H,
          z: 0.034 * H,
          rx: -0.5,
        });
    } else if (prop === 'tray') {
      cone(chest, 'tray', {
        dTop: 0.24 * H,
        dBot: 0.2 * H,
        h: 0.014 * H,
        hex: propHex,
        y: -0.1 * H,
        z: 0.19 * H,
        rx: 1.15,
      });
      if (!low)
        box(chest, 'bowl', {
          w: 0.07 * H,
          h: 0.035 * H,
          d: 0.07 * H,
          hex: '#efe7d8',
          surface: 'paper',
          y: -0.06 * H,
          z: 0.2 * H,
        });
    } else if (prop === 'clipboard') {
      box(wristN, 'clipboard', {
        w: 0.09 * H,
        h: 0.13 * H,
        d: 0.01 * H,
        hex: propHex,
        y: -0.06 * H,
        z: 0.04 * H,
        rx: -0.4,
      });
      if (!low)
        box(wristN, 'clipboard-sheet', {
          w: 0.078 * H,
          h: 0.11 * H,
          d: 0.004 * H,
          hex: '#f6f3ea',
          surface: 'paper',
          y: -0.06 * H,
          z: 0.047 * H,
          rx: -0.4,
        });
    } else if (prop === 'cup') {
      cone(wristP, 'cup', {
        dTop: 0.05 * H,
        dBot: 0.038 * H,
        h: 0.09 * H,
        hex: propHex,
        y: -0.055 * H,
        z: 0.026 * H,
      });
      if (!low)
        box(wristP, 'straw', {
          w: 0.006 * H,
          h: 0.06 * H,
          d: 0.006 * H,
          hex: '#c8453f',
          y: -0.01 * H,
          z: 0.026 * H,
          rz: 0.18,
        });
    } else if (prop === 'notebook') {
      box(wristN, 'notebook', {
        w: 0.07 * H,
        h: 0.1 * H,
        d: 0.016 * H,
        hex: propHex,
        surface: 'paper',
        y: -0.055 * H,
        z: 0.03 * H,
        rx: -0.35,
      });
      if (!low)
        box(wristN, 'notebook-band', {
          w: 0.072 * H,
          h: 0.016 * H,
          d: 0.018 * H,
          hex: '#c0555f',
          y: -0.03 * H,
          z: 0.032 * H,
          rx: -0.35,
        });
    }

    // ── Контактная тень ────────────────────────────────────────────────────
    if (opts.contactShadow !== false) {
      const disc = CreateDisc(`${name}:shadow`, { radius: 1, tessellation: low ? 10 : 20 }, scene);
      disc.parent = root;
      disc.material = shadowMaterial(scene);
      disc.rotation.x = Math.PI / 2;
      disc.scaling.set(0.3 * H, 0.22 * H, 1);
      disc.position.y = 0.004;
      this.shadow = push(disc);
    } else {
      this.shadow = null;
    }
  }

  /** Текущий поворот корпуса в радианах. */
  get facing() {
    return this.yaw;
  }

  /** Позиция головы в мировых координатах. */
  headPosition(out = new Vector3()) {
    return out.copyFrom(this.j.head.getAbsolutePosition());
  }

  /** Пометка для сцены: по ней определяется нажатие именно на этого персонажа. */
  setPickTag(tag: string | null) {
    for (const m of this.meshes) m.metadata = { ...(m.metadata ?? {}), tag };
  }

  setPickable(pickable: boolean) {
    for (const m of this.meshes) m.isPickable = pickable;
  }

  setVisibility(v: number) {
    for (const m of this.meshes) m.visibility = v;
  }

  dispose() {
    for (const m of this.meshes) m.dispose();
    this.root.dispose(false, true);
  }

  /**
   * Один кадр анимации.
   * @param dt длительность кадра в секундах
   * @param state пройденная дистанция, поворот корпуса, цель взгляда, энергия речи
   */
  update(dt: number, state: FrameState) {
    if (dt <= 0) return;
    const H = this.h;
    const j = this.j;
    const pose = this.pose;

    this.t += dt * this.look.tempo;
    const t = this.t;

    // Скорость и амплитуда шага.
    const speed = state.distance / dt;
    const target = clamp(speed / (1.25 * (H / 1.7)), 0, 1);
    this.amp += (target - this.amp) * clamp(dt * (target > this.amp ? 14 : 8), 0, 1);
    const amp = this.amp;
    const idle = 1 - amp;

    // Фаза шага считается по реальному пути, а длина шага растёт со скоростью:
    // так стопы не проскальзывают ни на медленной прогулке, ни на быстром переходе.
    const stride = 0.72 * H * clamp(0.45 + 0.55 * this.amp, 0.45, 1.6);
    if (state.distance > 0)
      this.phase = (this.phase + (state.distance / stride) * Math.PI * 2) % (Math.PI * 2);
    const ph = this.phase;
    const sw = Math.sin(ph);

    // Поворот корпуса.
    if (state.facing !== undefined) {
      this.yaw = wrap(this.yaw + wrap(state.facing - this.yaw) * clamp(dt * 5, 0, 1));
      this.root.rotation.y = this.yaw;
    }

    // Взгляд.
    let wantYaw = 0;
    let wantPitch = 0;
    if (state.lookAt) {
      const hp = j.head.getAbsolutePosition();
      const dx = state.lookAt.x - hp.x;
      const dy = state.lookAt.y - hp.y;
      const dz = state.lookAt.z - hp.z;
      wantYaw = clamp(wrap(Math.atan2(dx, dz) - this.yaw), -1.1, 1.1);
      wantPitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.32, 0.42);
    }
    this.headYaw += (wantYaw - this.headYaw) * clamp(dt * 3.5, 0, 1);
    this.headPitch += (wantPitch - this.headPitch) * clamp(dt * 3.5, 0, 1);

    // Энергия речи.
    this.gesture += ((state.talk ?? 0) - this.gesture) * clamp(dt * 4, 0, 1);
    const g = this.gesture;

    // Моргание.
    this.blinkIn -= dt;
    if (this.blinkIn <= 0) {
      this.blink = 1;
      this.blinkIn = 2.2 + Math.random() * 4.5;
    }
    if (this.blink > 0) this.blink = Math.max(0, this.blink - dt * 7);
    const closing = this.blink > 0 ? Math.sin(Math.PI * (1 - this.blink)) : 0;
    const eyeScale = Math.max(0.06, 1 - closing);
    this.eyeP.scaling.y = eyeScale;
    this.eyeN.scaling.y = eyeScale;
    const lidY = this.lidBase - this.lidDrop * closing;
    this.lidP.position.y = lidY;
    this.lidN.position.y = lidY;

    // Дыхание и перенос веса.
    const breath = Math.sin(t * 1.7);
    const shift = Math.sin(t * 0.42);

    // ── Таз, корпус, голова ────────────────────────────────────────────────
    j.pelvis.position.y =
      this.basePelvisY + 0.016 * H * amp * Math.cos(2 * ph) + 0.005 * H * breath * idle;
    j.pelvis.position.x = 0.014 * H * amp * Math.sin(ph) + 0.01 * H * shift * idle;
    j.pelvis.rotation.z = 0.022 * shift * idle + 0.02 * Math.sin(ph) * amp;
    j.pelvis.rotation.y = 0.09 * amp * Math.sin(ph) + 0.03 * Math.sin(t * 0.24) * idle;
    j.waist.rotation.x = 0.02 * breath * idle + 0.03 * amp;
    j.chest.rotation.x =
      pose.lean * idle + 0.07 * amp + 0.018 * breath * idle + Math.sin(t * 3.1) * 0.02 * g * idle;
    j.chest.rotation.y = -0.13 * amp * Math.sin(ph) + Math.sin(t * 2.2) * 0.03 * g * idle;
    j.chest.rotation.z = -j.pelvis.rotation.z * 0.35;
    j.neck.rotation.x = -j.chest.rotation.x * 0.25;
    j.head.rotation.y =
      this.headYaw +
      -j.chest.rotation.y * 0.55 * idle +
      (Math.sin(t * 0.31) * 0.14 + Math.sin(t * 0.17 + 1.3) * 0.07) * idle * (1 - g * 0.7);
    j.head.rotation.x =
      this.headPitch +
      Math.sin(t * 0.24) * 0.035 * idle +
      Math.sin(t * 3.4) * 0.05 * g * idle -
      0.04 * amp;
    j.head.rotation.z = Math.sin(t * 0.19) * 0.03 * idle + j.pelvis.rotation.z * 0.2;

    // ── Ноги ───────────────────────────────────────────────────────────────
    const legPose = (
      hip: TransformNode,
      knee: TransformNode,
      ankle: TransformNode,
      sign: 1 | -1
    ) => {
      const opp = sign > 0 ? 0 : Math.PI;
      const thigh = -sw * sign * 0.5 * amp + 0.015 * idle;
      const bend = 0.06 * idle + 0.95 * amp * Math.max(0, Math.sin(ph + opp + 1.15));
      hip.rotation.x = thigh;
      hip.rotation.z = 0.02 * sign * idle;
      knee.rotation.x = bend;
      ankle.rotation.x = -(thigh + bend) * 0.85 + 0.18 * amp * Math.sin(ph + opp - 1.1);
    };
    legPose(j.hipP, j.kneeP, j.ankleP, 1);
    legPose(j.hipN, j.kneeN, j.ankleN, -1);

    // ── Руки ───────────────────────────────────────────────────────────────
    const armPose = (
      shoulder: TransformNode,
      elbow: TransformNode,
      sign: 1 | -1,
      gesturePhase: number
    ) => {
      const swing = sw * sign * 0.42 * amp;
      shoulder.rotation.x = lerp(
        pose.shoulderX + 0.02 * breath * idle + 0.05 * g * idle,
        swing,
        amp
      );
      // sign — наружу, −sign — внутрь (сомкнутые руки).
      shoulder.rotation.z =
        sign * pose.shoulderZ * idle +
        sign * (0.015 + 0.03 * amp) +
        Math.sin(t * 1.1 + gesturePhase) * 0.02 * idle;
      shoulder.rotation.y = sign * pose.twist * idle;
      elbow.rotation.x =
        lerp(
          pose.elbow + Math.sin(t * 4.5 + gesturePhase) * 0.22 * g * idle,
          -0.28 - 0.42 * amp * Math.max(0, -sw * sign),
          amp
        ) +
        0.01 * breath * idle;
      elbow.rotation.z = -sign * pose.elbowZ * idle;
      elbow.rotation.y = sign * 0.05 * idle;
    };
    armPose(j.shoulderP, j.elbowP, 1, 0);
    armPose(j.shoulderN, j.elbowN, -1, 1.7);

    if (this.shadow) {
      const s = 1 - 0.06 * amp * Math.cos(2 * ph);
      this.shadow.scaling.set(0.3 * H * s, 0.22 * H * s, 1);
    }
  }
}

/** Угол от одной точки к другой в плоскости XZ — поворот «лицом к собеседнику». */
export function angleTo(from: Vector3, to: Vector3) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}
