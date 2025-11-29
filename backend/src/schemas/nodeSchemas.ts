import type { NodeSchema, FieldType } from '../types/index.js';

/**
 * Simplified node schemas for common InvokeAI nodes.
 * These define the inputs/outputs and their types for validation.
 *
 * In a production setup, these would be generated from the InvokeAI OpenAPI schema.
 */

const singleField = (name: string): FieldType => ({
  name,
  cardinality: 'SINGLE',
  batch: false,
});

const collectionField = (name: string): FieldType => ({
  name,
  cardinality: 'COLLECTION',
  batch: false,
});

export const nodeSchemas: Record<string, NodeSchema> = {
  // Primitives
  integer: {
    type: 'integer',
    title: 'Integer',
    description: 'An integer primitive',
    version: '1.0.0',
    category: 'primitives',
    inputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The integer value',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The integer value',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  float: {
    type: 'float',
    title: 'Float',
    description: 'A float primitive',
    version: '1.0.0',
    category: 'primitives',
    inputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The float value',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The float value',
        type: singleField('FloatField'),
        input: 'connection',
        required: true,
      },
    },
  },

  string: {
    type: 'string',
    title: 'String',
    description: 'A string primitive',
    version: '1.0.0',
    category: 'primitives',
    inputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The string value',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'The string value',
        type: singleField('StringField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Compel (Text Encoder)
  compel: {
    type: 'compel',
    title: 'Compel Prompt',
    description: 'Parse and encode prompt text using CLIP',
    version: '1.2.0',
    category: 'conditioning',
    inputs: {
      prompt: {
        name: 'prompt',
        title: 'Prompt',
        description: 'The prompt to encode',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP model',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      conditioning: {
        name: 'conditioning',
        title: 'Conditioning',
        description: 'Conditioning tensor',
        type: singleField('ConditioningField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Model Loader
  main_model_loader: {
    type: 'main_model_loader',
    title: 'Main Model Loader',
    description: 'Load a main model',
    version: '1.0.0',
    category: 'model_loaders',
    inputs: {
      model: {
        name: 'model',
        title: 'Model',
        description: 'The model to load',
        type: singleField('ModelIdentifierField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      unet: {
        name: 'unet',
        title: 'UNet',
        description: 'UNet model',
        type: singleField('UNetField'),
        input: 'connection',
        required: true,
      },
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP model',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Noise
  noise: {
    type: 'noise',
    title: 'Noise',
    description: 'Generate noise tensor',
    version: '1.0.0',
    category: 'latents',
    inputs: {
      seed: {
        name: 'seed',
        title: 'Seed',
        description: 'Random seed',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Width',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Height',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      noise: {
        name: 'noise',
        title: 'Noise',
        description: 'Noise tensor',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Denoise Latents
  denoise_latents: {
    type: 'denoise_latents',
    title: 'Denoise Latents',
    description: 'Denoise latents using a diffusion model',
    version: '1.5.0',
    category: 'latents',
    inputs: {
      positive_conditioning: {
        name: 'positive_conditioning',
        title: 'Positive Conditioning',
        description: 'Positive conditioning tensor',
        type: singleField('ConditioningField'),
        input: 'connection',
        required: true,
      },
      negative_conditioning: {
        name: 'negative_conditioning',
        title: 'Negative Conditioning',
        description: 'Negative conditioning tensor',
        type: singleField('ConditioningField'),
        input: 'connection',
        required: true,
      },
      noise: {
        name: 'noise',
        title: 'Noise',
        description: 'Noise tensor',
        type: singleField('LatentsField'),
        input: 'connection',
        required: false,
      },
      unet: {
        name: 'unet',
        title: 'UNet',
        description: 'UNet model',
        type: singleField('UNetField'),
        input: 'connection',
        required: true,
      },
      steps: {
        name: 'steps',
        title: 'Steps',
        description: 'Number of denoising steps',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      cfg_scale: {
        name: 'cfg_scale',
        title: 'CFG Scale',
        description: 'Classifier-free guidance scale',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
      scheduler: {
        name: 'scheduler',
        title: 'Scheduler',
        description: 'Sampling scheduler',
        type: singleField('SchedulerField'),
        input: 'direct',
        required: true,
      },
      denoising_start: {
        name: 'denoising_start',
        title: 'Denoising Start',
        description: 'Start denoising at this step',
        type: singleField('FloatField'),
        input: 'any',
        required: false,
      },
      denoising_end: {
        name: 'denoising_end',
        title: 'Denoising End',
        description: 'End denoising at this step',
        type: singleField('FloatField'),
        input: 'any',
        required: false,
      },
    },
    outputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Denoised latents',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Latents to Image (VAE Decode)
  l2i: {
    type: 'l2i',
    title: 'Latents to Image',
    description: 'Decode latents to image using VAE',
    version: '1.3.0',
    category: 'latents',
    inputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Latents to decode',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Decoded image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Image to Latents (VAE Encode)
  i2l: {
    type: 'i2l',
    title: 'Image to Latents',
    description: 'Encode image to latents using VAE',
    version: '1.0.0',
    category: 'latents',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Image to encode',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Encoded latents',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Save Image
  save_image: {
    type: 'save_image',
    title: 'Save Image',
    description: 'Save an image to the gallery',
    version: '1.0.0',
    category: 'image',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Image to save',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      board: {
        name: 'board',
        title: 'Board',
        description: 'Board to save to',
        type: singleField('BoardField'),
        input: 'direct',
        required: false,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Saved image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // SDXL Model Loader
  sdxl_model_loader: {
    type: 'sdxl_model_loader',
    title: 'SDXL Model Loader',
    description: 'Load an SDXL main model',
    version: '1.0.4',
    category: 'model_loaders',
    inputs: {
      model: {
        name: 'model',
        title: 'Model',
        description: 'The SDXL model to load',
        type: singleField('MainModelField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      unet: {
        name: 'unet',
        title: 'UNet',
        description: 'UNet model',
        type: singleField('UNetField'),
        input: 'connection',
        required: true,
      },
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP text encoder (first)',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      clip2: {
        name: 'clip2',
        title: 'CLIP 2',
        description: 'CLIP text encoder (second)',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // SDXL Compel Prompt
  sdxl_compel_prompt: {
    type: 'sdxl_compel_prompt',
    title: 'SDXL Compel Prompt',
    description: 'Parse and encode prompt for SDXL',
    version: '1.2.1',
    category: 'conditioning',
    inputs: {
      prompt: {
        name: 'prompt',
        title: 'Prompt',
        description: 'The prompt to encode',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
      style: {
        name: 'style',
        title: 'Style',
        description: 'Style prompt',
        type: singleField('StringField'),
        input: 'any',
        required: false,
      },
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP text encoder (first)',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      clip2: {
        name: 'clip2',
        title: 'CLIP 2',
        description: 'CLIP text encoder (second)',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      conditioning: {
        name: 'conditioning',
        title: 'Conditioning',
        description: 'Conditioning tensor',
        type: singleField('ConditioningField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // VAE Loader
  vae_loader: {
    type: 'vae_loader',
    title: 'VAE Loader',
    description: 'Load a VAE model',
    version: '1.0.4',
    category: 'model_loaders',
    inputs: {
      vae_model: {
        name: 'vae_model',
        title: 'VAE Model',
        description: 'The VAE model to load',
        type: singleField('VAEModelField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Random Integer
  rand_int: {
    type: 'rand_int',
    title: 'Random Integer',
    description: 'Generate a random integer',
    version: '1.0.1',
    category: 'primitives',
    inputs: {
      low: {
        name: 'low',
        title: 'Low',
        description: 'Minimum value',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      high: {
        name: 'high',
        title: 'High',
        description: 'Maximum value',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Random integer',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // String Join
  string_join: {
    type: 'string_join',
    title: 'String Join',
    description: 'Join two strings',
    version: '1.0.1',
    category: 'primitives',
    inputs: {
      string_left: {
        name: 'string_left',
        title: 'String Left',
        description: 'Left string',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
      string_right: {
        name: 'string_right',
        title: 'String Right',
        description: 'Right string',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Joined string',
        type: singleField('StringField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // ===== FLUX NODES =====

  // Flux Model Loader
  flux_model_loader: {
    type: 'flux_model_loader',
    title: 'Flux Model Loader',
    description: 'Load a FLUX model',
    version: '1.0.6',
    category: 'model_loaders',
    inputs: {
      model: {
        name: 'model',
        title: 'Model',
        description: 'FLUX main model',
        type: singleField('MainModelField'),
        input: 'direct',
        required: true,
      },
      t5_encoder_model: {
        name: 't5_encoder_model',
        title: 'T5 Encoder',
        description: 'T5 encoder model',
        type: singleField('T5EncoderModelField'),
        input: 'direct',
        required: true,
      },
      clip_embed_model: {
        name: 'clip_embed_model',
        title: 'CLIP Embed',
        description: 'CLIP embed model',
        type: singleField('CLIPEmbedModelField'),
        input: 'direct',
        required: true,
      },
      vae_model: {
        name: 'vae_model',
        title: 'VAE Model',
        description: 'VAE model',
        type: singleField('VAEModelField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      transformer: {
        name: 'transformer',
        title: 'Transformer',
        description: 'FLUX transformer',
        type: singleField('FluxTransformerField'),
        input: 'connection',
        required: true,
      },
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP encoder',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      t5_encoder: {
        name: 't5_encoder',
        title: 'T5 Encoder',
        description: 'T5 text encoder',
        type: singleField('T5EncoderField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
      max_seq_len: {
        name: 'max_seq_len',
        title: 'Max Seq Len',
        description: 'Maximum sequence length',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux Text Encoder
  flux_text_encoder: {
    type: 'flux_text_encoder',
    title: 'Flux Text Encoder',
    description: 'Encode text for FLUX',
    version: '1.1.2',
    category: 'conditioning',
    inputs: {
      clip: {
        name: 'clip',
        title: 'CLIP',
        description: 'CLIP encoder',
        type: singleField('CLIPField'),
        input: 'connection',
        required: true,
      },
      t5_encoder: {
        name: 't5_encoder',
        title: 'T5 Encoder',
        description: 'T5 encoder',
        type: singleField('T5EncoderField'),
        input: 'connection',
        required: true,
      },
      t5_max_seq_len: {
        name: 't5_max_seq_len',
        title: 'T5 Max Seq Len',
        description: 'Maximum T5 sequence length',
        type: singleField('IntegerField'),
        input: 'any',
        required: false,
      },
      prompt: {
        name: 'prompt',
        title: 'Prompt',
        description: 'Text prompt',
        type: singleField('StringField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      conditioning: {
        name: 'conditioning',
        title: 'Conditioning',
        description: 'FLUX conditioning',
        type: singleField('FluxConditioningField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux Denoise
  flux_denoise: {
    type: 'flux_denoise',
    title: 'Flux Denoise',
    description: 'Denoise latents using FLUX',
    version: '4.0.0',
    category: 'latents',
    inputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Input latents',
        type: singleField('LatentsField'),
        input: 'connection',
        required: false,
      },
      transformer: {
        name: 'transformer',
        title: 'Transformer',
        description: 'FLUX transformer',
        type: singleField('FluxTransformerField'),
        input: 'connection',
        required: true,
      },
      positive_text_conditioning: {
        name: 'positive_text_conditioning',
        title: 'Positive Conditioning',
        description: 'Positive text conditioning',
        type: singleField('FluxConditioningField'),
        input: 'connection',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Output width',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Output height',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      num_steps: {
        name: 'num_steps',
        title: 'Steps',
        description: 'Number of steps',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      guidance: {
        name: 'guidance',
        title: 'Guidance',
        description: 'Guidance scale',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
      seed: {
        name: 'seed',
        title: 'Seed',
        description: 'Random seed',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      kontext_conditioning: {
        name: 'kontext_conditioning',
        title: 'Kontext Conditioning',
        description: 'Kontext conditioning',
        type: singleField('FluxKontextCondField'),
        input: 'connection',
        required: false,
      },
      redux_conditioning: {
        name: 'redux_conditioning',
        title: 'Redux Conditioning',
        description: 'Redux conditioning',
        type: collectionField('FluxReduxCondField'),
        input: 'connection',
        required: false,
      },
      controlnet_vae: {
        name: 'controlnet_vae',
        title: 'ControlNet VAE',
        description: 'VAE for ControlNet',
        type: singleField('VAEField'),
        input: 'connection',
        required: false,
      },
    },
    outputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Denoised latents',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux VAE Encode
  flux_vae_encode: {
    type: 'flux_vae_encode',
    title: 'Flux VAE Encode',
    description: 'Encode image to latents using FLUX VAE',
    version: '1.0.1',
    category: 'latents',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Image to encode',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Encoded latents',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Image width',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Image height',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux VAE Decode
  flux_vae_decode: {
    type: 'flux_vae_decode',
    title: 'Flux VAE Decode',
    description: 'Decode latents to image using FLUX VAE',
    version: '1.0.2',
    category: 'latents',
    inputs: {
      latents: {
        name: 'latents',
        title: 'Latents',
        description: 'Latents to decode',
        type: singleField('LatentsField'),
        input: 'connection',
        required: true,
      },
      vae: {
        name: 'vae',
        title: 'VAE',
        description: 'VAE model',
        type: singleField('VAEField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Decoded image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux Kontext
  flux_kontext: {
    type: 'flux_kontext',
    title: 'Flux Kontext',
    description: 'FLUX Kontext image conditioning',
    version: '1.0.0',
    category: 'conditioning',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Reference image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      kontext_cond: {
        name: 'kontext_cond',
        title: 'Kontext Conditioning',
        description: 'Kontext conditioning output',
        type: singleField('FluxKontextCondField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Flux Redux
  flux_redux: {
    type: 'flux_redux',
    title: 'Flux Redux',
    description: 'FLUX Redux reference image',
    version: '2.0.0',
    category: 'conditioning',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Reference image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      redux_model: {
        name: 'redux_model',
        title: 'Redux Model',
        description: 'FLUX Redux model',
        type: singleField('FluxReduxModelField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      redux_cond: {
        name: 'redux_cond',
        title: 'Redux Conditioning',
        description: 'Redux conditioning output',
        type: singleField('FluxReduxCondField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Image Batch
  image_batch: {
    type: 'image_batch',
    title: 'Image Batch',
    description: 'Create a batch of images',
    version: '1.0.0',
    category: 'image',
    inputs: {
      images: {
        name: 'images',
        title: 'Images',
        description: 'Images for batch',
        type: collectionField('ImageField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Batch image output',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Collect
  collect: {
    type: 'collect',
    title: 'Collect',
    description: 'Collect items into a collection',
    version: '1.0.0',
    category: 'util',
    inputs: {
      item: {
        name: 'item',
        title: 'Item',
        description: 'Item to collect',
        type: singleField('AnyField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      collection: {
        name: 'collection',
        title: 'Collection',
        description: 'Collected items',
        type: collectionField('AnyField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Image (passthrough)
  image: {
    type: 'image',
    title: 'Image',
    description: 'Image passthrough node',
    version: '1.0.2',
    category: 'image',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Input image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Output image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Image width',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Image height',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Image Resize
  img_resize: {
    type: 'img_resize',
    title: 'Image Resize',
    description: 'Resize an image',
    version: '1.2.2',
    category: 'image',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Image to resize',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Target width',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Target height',
        type: singleField('IntegerField'),
        input: 'any',
        required: true,
      },
    },
    outputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Resized image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Output width',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Output height',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Float to Integer
  float_to_int: {
    type: 'float_to_int',
    title: 'Float to Integer',
    description: 'Convert float to integer',
    version: '1.0.1',
    category: 'primitives',
    inputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Float value',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
      multiple: {
        name: 'multiple',
        title: 'Multiple',
        description: 'Round to multiple of',
        type: singleField('IntegerField'),
        input: 'any',
        required: false,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Integer value',
        type: singleField('IntegerField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Float Math
  float_math: {
    type: 'float_math',
    title: 'Float Math',
    description: 'Perform math on floats',
    version: '1.0.1',
    category: 'primitives',
    inputs: {
      a: {
        name: 'a',
        title: 'A',
        description: 'First operand',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
      b: {
        name: 'b',
        title: 'B',
        description: 'Second operand',
        type: singleField('FloatField'),
        input: 'any',
        required: true,
      },
      operation: {
        name: 'operation',
        title: 'Operation',
        description: 'Math operation',
        type: singleField('StringField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Result',
        type: singleField('FloatField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Metadata from Image
  metadata_from_image: {
    type: 'metadata_from_image',
    title: 'Metadata from Image',
    description: 'Extract metadata from image',
    version: '1.0.1',
    category: 'metadata',
    inputs: {
      image: {
        name: 'image',
        title: 'Image',
        description: 'Source image',
        type: singleField('ImageField'),
        input: 'connection',
        required: true,
      },
    },
    outputs: {
      metadata: {
        name: 'metadata',
        title: 'Metadata',
        description: 'Image metadata',
        type: singleField('MetadataField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Metadata to String
  metadata_to_string: {
    type: 'metadata_to_string',
    title: 'Metadata to String',
    description: 'Extract string from metadata',
    version: '1.0.0',
    category: 'metadata',
    inputs: {
      metadata: {
        name: 'metadata',
        title: 'Metadata',
        description: 'Metadata input',
        type: singleField('MetadataField'),
        input: 'connection',
        required: true,
      },
      label: {
        name: 'label',
        title: 'Label',
        description: 'Field to extract',
        type: singleField('StringField'),
        input: 'direct',
        required: true,
      },
    },
    outputs: {
      value: {
        name: 'value',
        title: 'Value',
        description: 'Extracted string',
        type: singleField('StringField'),
        input: 'connection',
        required: true,
      },
    },
  },

  // Core Metadata
  core_metadata: {
    type: 'core_metadata',
    title: 'Core Metadata',
    description: 'Create core metadata',
    version: '2.0.0',
    category: 'metadata',
    inputs: {
      seed: {
        name: 'seed',
        title: 'Seed',
        description: 'Seed value',
        type: singleField('IntegerField'),
        input: 'any',
        required: false,
      },
      positive_prompt: {
        name: 'positive_prompt',
        title: 'Positive Prompt',
        description: 'Positive prompt',
        type: singleField('StringField'),
        input: 'any',
        required: false,
      },
      width: {
        name: 'width',
        title: 'Width',
        description: 'Image width',
        type: singleField('IntegerField'),
        input: 'any',
        required: false,
      },
      height: {
        name: 'height',
        title: 'Height',
        description: 'Image height',
        type: singleField('IntegerField'),
        input: 'any',
        required: false,
      },
    },
    outputs: {
      metadata: {
        name: 'metadata',
        title: 'Metadata',
        description: 'Core metadata',
        type: singleField('MetadataField'),
        input: 'connection',
        required: true,
      },
    },
  },
};
