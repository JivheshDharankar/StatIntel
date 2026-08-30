import { BaseLocalPdfAdapter } from './index';
import { ResourceSource, ResourceSourceCategory } from '../types';

export class LocalIGOTAdapter extends BaseLocalPdfAdapter {
  readonly sourceName: ResourceSource = 'iGOT';
  readonly sourceCategory: ResourceSourceCategory = 'iGOT';
}

export class LocalNSSTAAdapter extends BaseLocalPdfAdapter {
  readonly sourceName: ResourceSource = 'NSSTA';
  readonly sourceCategory: ResourceSourceCategory = 'NSSTA';
}

export class LocalTPACAdapter extends BaseLocalPdfAdapter {
  readonly sourceName: ResourceSource = 'TPAC';
  readonly sourceCategory: ResourceSourceCategory = 'TPAC';
}

export class LocalLearningMaterialAdapter extends BaseLocalPdfAdapter {
  readonly sourceName: ResourceSource = 'MoSPI';
  readonly sourceCategory: ResourceSourceCategory = 'Learning Material';
}
