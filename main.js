import './style.css';
import { useLineCubes } from './src/cubes';
import { useLineTriangles } from './src/triangles';
import { useLineSpheres } from './src/half-sphere';
import { useLineFullSpheres } from './src/full-sphere';

try {
  useLineCubes();
}
catch(error) {}
try {
  useLineTriangles();
}
catch(error) {}
try {
  useLineFullSpheres();
}
catch(error) {}
try {
  useLineSpheres();
}
catch (error){}
