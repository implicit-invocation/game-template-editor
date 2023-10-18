import { Static, Type as t } from "@sinclair/typebox";

export const ColorPropertySchema = t.Object({
  type: t.Literal("color"),
  hex: t.String(),
});

export const NumberPropertySchema = t.Object({
  type: t.Literal("number"),
  value: t.Number(),
});

export const TextPropertySchema = t.Object({
  type: t.Literal("text"),
  value: t.String(),
});

export const BooleanPropertySchema = t.Object({
  type: t.Literal("boolean"),
  value: t.Boolean(),
});

export const TexturePropertySchema = t.Object({
  type: t.Literal("texture"),
  url: t.String(),
});

export const TextureAtlasPropertySchema = t.Object({
  type: t.Literal("textureAtlas"),
  url: t.String(),
  imagePath: t.String(),
});

export const BitmapFontPropertySchema = t.Object({
  type: t.Literal("bitmapFont"),
  url: t.String(),
  imagePath: t.String(),
});

export const JSONPropertySchema = t.Object({
  type: t.Literal("json"),
  value: t.String(),
});

export const PropertySchema = t.Union([
  ColorPropertySchema,
  NumberPropertySchema,
  TextPropertySchema,
  BooleanPropertySchema,
  TexturePropertySchema,
  TextureAtlasPropertySchema,
  BitmapFontPropertySchema,
  JSONPropertySchema,
]);

export type ColorProperty = Static<typeof ColorPropertySchema>;
export type NumberProperty = Static<typeof NumberPropertySchema>;
export type TextProperty = Static<typeof TextPropertySchema>;
export type BooleanProperty = Static<typeof BooleanPropertySchema>;
export type TextureProperty = Static<typeof TexturePropertySchema>;
export type TextureAtlasProperty = Static<typeof TextureAtlasPropertySchema>;
export type BitmapFontProperty = Static<typeof BitmapFontPropertySchema>;
export type JSONProperty = Static<typeof JSONPropertySchema>;

export type Property = Static<typeof PropertySchema>;

export type PropertyType = Property["type"];

export type BasePreviewComponent = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImagePreviewComponent = BasePreviewComponent & {
  type: "image";
  texture: string;
};

export type AtlasImagePreviewComponent = BasePreviewComponent & {
  type: "atlasImage";
  atlas: string;
  region: string;
  index?: number;
};

export type TextPreviewComponent = BasePreviewComponent & {
  type: "text";
  text: string;
  font: string;
  fontSize: number;
};

export type AnimationPreviewComponent = BasePreviewComponent & {
  type: "animation";
  atlas: string;
  region: string;
  frameDuration: number[];
};

// TODO: truetype, parallax, spine, particle, sound, music, json

export type PreviewComponent =
  | ImagePreviewComponent
  | TextPreviewComponent
  | AtlasImagePreviewComponent
  | AnimationPreviewComponent;

export type Preview = {
  width: number;
  height: number;
  bgColor: string;
  components: PreviewComponent[];
};

export type WizardStep = {
  name: string;
  fields: {
    [key: string]: PropertyType;
  };
  preview: Preview;
};

export type TemplateConfig = {
  [key: string]: Property;
};

export type Wizard = {
  steps: WizardStep[];
  defaultValues?: TemplateConfig;
};
