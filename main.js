import './style.css';
import { useLineCubes } from './src/cubes';
import { useLineTriangles } from './src/triangles';

try {
  useLineCubes();
}
catch {}
try {
  useLineTriangles();
}
catch {}
