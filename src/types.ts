import { Collection } from '@discordjs/collection';
import { APIRole } from 'discord-api-types/v10';

export type RoleCollection = Collection<string, APIRole>;

export interface ColorStruct {
  hex: HexData;
  rgb: RGBData;
  hsl: HSLData;
  hsv: HSVData;
  name: NameData;
  cmyk: CMYKData;
  xyz: XYZData;
  image: ImageDict;
  contrast: ContrastData;
  _links: LinksDict;
  _embedded: unknown;
}

interface HexData {
  value: string;
  clean: string;
}

interface RGBData {
  r: number;
  g: number;
  b: number;
  value: string;
  fraction: {
    r: number;
    g: number;
    b: number;
  };
}

interface HSLData {
  h: number;
  s: number;
  l: number;
  value: string;
  fraction: {
    h: number;
    s: number;
    l: number;
  };
}

interface HSVData {
  h: number;
  s: number;
  v: number;
  value: string;
  fraction: {
    h: number;
    s: number;
    v: number;
  };
}

interface NameData {
  value: string;
  closest_named_hex: string;
  exact_match_name: boolean;
  distance: number;
}

interface CMYKData {
  c: number;
  m: number;
  y: number;
  k: number;
  value: string;
  fraction: {
    c: number;
    m: number;
    y: number;
    k: number;
  };
}

interface XYZData {
  X: number;
  Y: number;
  Z: number;
  value: string;
  fraction: {
    X: number;

    Y: number;
    Z: number;
  };
}

interface ImageDict {
  bare: string;
  named: string;
}

interface ContrastData {
  value: string;
}

interface LinksDict {
  self: {
    href: string;
  };
}
