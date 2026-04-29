export interface ProjectData {
  projectName: string;
  sourceAsset: string | null;
  units: 'meters' | 'centimeters' | 'inches';
  objects: Array<{
    id: string;
    mesh: string;
    originalMesh?: string;
  }>;
  masks: Array<{
    id: string;
    file: string;
  }>;
  materials: Array<{
    id: string;
    maps: {
      albedo?: string;
      normal?: string;
      roughness?: string;
      metallic?: string;
      ao?: string;
      height?: string;
      mask_id?: string;
    };
  }>;
  exportPresets: string[];
  lastModified?: number;
}

export class ProjectService {
  private static STORAGE_KEY = 'musi_enviro_active_project';

  static createNew(name: string): ProjectData {
    return {
      projectName: name,
      sourceAsset: null,
      units: 'meters',
      objects: [],
      masks: [],
      materials: [],
      exportPresets: ['unreal', 'unity', 'blender']
    };
  }

  static saveToLocalStorage(project: ProjectData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      ...project,
      lastModified: Date.now()
    }));
  }

  static getActive(): ProjectData | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
}
