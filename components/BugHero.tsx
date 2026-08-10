"use client";



import { useEffect, useRef } from "react";
import * as THREE from "three";

export type BugStatus = "open" | "in_progress" | "verified" | "closed";

const COLORS: Record<BugStatus, number> = {
  open: 0xd65c4f,
  closed: 0x8d8d8d,
  in_progress: 0xe2a33d,
  verified: 0x5fa777, // matches the tree's leaf green — same signal-green token
};

/**
 * 3D hero bug — red/jittery when open, amber/slowing in progress,
 * green/settled when verified. Status is driven externally (scroll
 * position, a timed loop, or real project data) via the `status` prop.
 */
export function BugHero({ status }: { status: BugStatus }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<BugStatus>(status);
  const stateRef = useRef({ jitter: 1, speed: 1, settled: false });

  useEffect(() => {
    statusRef.current = status;
    const target =
      status === "open"
        ? { jitter: 1, speed: 1, settled: false }
        : status === "in_progress"
        ? { jitter: 0.35, speed: 0.5, settled: false }
        : status === "verified"
        ? { jitter: 0, speed: 0.15, settled: true }
        : { jitter: 0, speed: 0.05, settled: true };
    stateRef.current = target;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0.5, 2.1, 6.2);
    camera.lookAt(0, 0.1, 0);

    function resize() {
      const el = canvas!;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.4);
    keyLight.position.set(3.5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbfd9ff, 0.6);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a28, 0.5));

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4, 32),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: COLORS[status],
      roughness: 0.32,
      metalness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b1a,
      roughness: 0.4,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      roughness: 0.15,
      metalness: 0.2,
    });

    const bugGroup = new THREE.Group();
    bugGroup.position.y = 0.05;
    scene.add(bugGroup);

    function shell(mesh: THREE.Mesh) {
      mesh.castShadow = true;
      return mesh;
    }

    const abdomen = shell(
      new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), shellMat)
    );
    abdomen.scale.set(0.95, 0.72, 1.35);
    abdomen.position.set(0, 0, -0.55);
    bugGroup.add(abdomen);

    for (let s = 0; s < 4; s++) {
      const ridge = new THREE.Mesh(
        new THREE.TorusGeometry(0.78 - s * 0.02, 0.02, 8, 32),
        darkMat
      );
      ridge.rotation.y = Math.PI / 2;
      ridge.scale.set(1, 0.7, 1);
      ridge.position.set(0, 0.05, -1.15 + s * 0.32);
      bugGroup.add(ridge);
    }

    const thorax = shell(
      new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), shellMat)
    );
    thorax.scale.set(0.9, 0.75, 0.85);
    thorax.position.set(0, 0.05, 0.55);
    bugGroup.add(thorax);

    const head = shell(
      new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), shellMat)
    );
    head.position.set(0, 0.12, 1.28);
    bugGroup.add(head);

    [-0.16, 0.16].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), eyeMat);
      eye.position.set(x, 0.2, 1.55);
      bugGroup.add(eye);
    });

    [-1, 1].forEach((side) => {
      const mandible = shell(
        new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 8), darkMat)
      );
      mandible.position.set(side * 0.12, -0.05, 1.62);
      mandible.rotation.x = Math.PI / 2.3;
      bugGroup.add(mandible);
    });

    const antennas: THREE.Group[] = [];
    [-1, 1].forEach((side) => {
      const group = new THREE.Group();
      group.position.set(side * 0.14, 0.4, 1.45);
      const seg1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.035, 0.4, 6),
        darkMat
      );
      seg1.position.y = 0.2;
      seg1.rotation.z = side * 0.55;
      group.add(seg1);
      const seg2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.025, 0.35, 6),
        darkMat
      );
      seg2.position.set(side * 0.16, 0.46, 0);
      seg2.rotation.z = side * 1.1;
      group.add(seg2);
      bugGroup.add(group);
      antennas.push(group);
    });

    type Leg = { hip: THREE.Group; knee: THREE.Group; phase: number };
    const legs: Leg[] = [];
    for (let i = 0; i < 6; i++) {
      const side = i < 3 ? -1 : 1;
      const zPos = 0.9 - (i % 3) * 0.75;
      const hip = new THREE.Group();
      hip.position.set(side * 0.75, -0.15, zPos);
      bugGroup.add(hip);

      const femur = shell(
        new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.65, 6), darkMat)
      );
      femur.position.set(side * 0.32, -0.05, 0);
      femur.rotation.z = side * 1.15;
      hip.add(femur);

      const knee = new THREE.Group();
      knee.position.set(side * 0.62, -0.28, 0);
      hip.add(knee);

      const tibia = shell(
        new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.6, 6), darkMat)
      );
      tibia.position.set(side * 0.18, -0.28, 0);
      tibia.rotation.z = side * 0.5;
      knee.add(tibia);

      legs.push({ hip, knee, phase: i * 1.05 });
    }

    let t = 0;
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const { jitter, speed, settled } = stateRef.current;
      t += 0.016 * (1 + speed);

      shellMat.color.setHex(COLORS[status]);

      bugGroup.rotation.y = Math.sin(t * 0.25) * 0.4 + t * 0.04 * speed;
      bugGroup.position.y = 0.05 + Math.sin(t * 2) * 0.045 * jitter;
      bugGroup.position.x = Math.sin(t * 3.1) * 0.05 * jitter;

      legs.forEach((l) => {
        const walk =
          Math.sin(t * 6 * (0.4 + speed) + l.phase) * (0.25 + jitter * 0.35);
        l.hip.rotation.x = walk * (settled ? 0.15 : 1);
        l.knee.rotation.x = -Math.abs(walk) * 0.6 * (settled ? 0.2 : 1);
      });

      antennas.forEach((a, idx) => {
        a.rotation.x = Math.sin(t * 4 + idx) * 0.12 * (0.2 + jitter);
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
