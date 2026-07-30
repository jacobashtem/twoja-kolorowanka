> ## Documentation Index
> Fetch the complete documentation index at: https://www.recraft.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Examples

Generate AI images using cURL or Python and create your own styles programmatically.

### Generate a raster image using Recraft V4.1 model

<CodeGroup>
  ```bash generate_recraftv4_1.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "two race cars on a track",
          "model": "recraftv4_1"
      }'
  ```

  ```python generate_recraftv4_1.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.images.generate(
    prompt='two race cars on a track',
    model='recraftv4_1'
  )
  print(response.data[0].url)
  ```
</CodeGroup>

### Generate a vector image using Recraft V4.1 Vector model

<CodeGroup>
  ```bash generate_recraftv4_1_vector.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "cat on a mat",
          "model": "recraftv4_1_vector"
      }'
  ```

  ```python generate_recraftv4_1_vector.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.images.generate(
    prompt='cat on a mat',
    model='recraftv4_1_vector'
  )
  print(response.data[0].url)
  ```
</CodeGroup>

### Generate an image using Recraft V4.1 Pro with specific size

<CodeGroup>
  ```bash generate_recraftv4_1_pro_with_size.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "red point siamese cat",
          "model": "recraftv4_1_pro",
          "size": "2560x1664"
      }'
  ```

  ```python generate_recraftv4_1_pro_with_size.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.images.generate(
    prompt='red point siamese cat',
    model='recraftv4_1_pro',
    size='2560x1664',
  )
  print(response.data[0].url)
  ```
</CodeGroup>

### Generate a digital illustration by Recraft V3 with specific style

<CodeGroup>
  ```bash generate_digital_illustration.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "a monster with lots of hands",
          "style": "Hand-drawn"
      }'
  ```

  ```python generate_digital_illustration.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.images.generate(
    prompt='a monster with lots of hands',
    style='Hand-drawn',
  )
  print(response.data[0].url)
  ```
</CodeGroup>

### Image to image by Recraft V3 with digital illustration style

<CodeGroup>
  ```bash image_to_image.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/imageToImage \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "image=@image.png" \
      -F "prompt=winter" \
      -F "strength=0.2" \
      -F "style=Illustration"
  ```

  ```bash image_to_image_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/imageToImage \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "image_url": "https://example.com/image.png",
          "prompt": "winter",
          "strength": 0.2,
          "style": "Illustration"
      }'
  ```

  ```python image_to_image.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/imageToImage',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={
          'image': open('image.png', 'rb'),
      },
      body={
          'prompt': 'winter',
          'strength': 0.2,
          'style': 'Illustration',
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>

### Inpaint an image by Recraft V3 with style Enterprise

<CodeGroup>
  ```bash inpaint.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/inpaint \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "prompt=moon" \
      -F "style=Enterprise" \
      -F "image=@image.png" -F "mask=@mask.png"
  ```

  ```bash inpaint_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/inpaint \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "moon",
          "style": "Enterprise",
          "image_url": "https://example.com/image.png",
          "mask_url": "https://example.com/mask.png"
      }'
  ```

  ```python inpaint.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/inpaint',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={
          'image': open('image.png', 'rb'),
          'mask': open('mask.png', 'rb'),
      },
      body={
          'style': 'Enterprise',
          'prompt': 'moon',
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>

### Outpaint an image by Recraft V3 to a 16:9 aspect ratio

<CodeGroup>
  ```bash outpaint.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/outpaint \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "prompt=a mountain landscape" \
      -F "size=16:9" \
      -F "zoom_out_percentage=25.0" \
      -F "image=@image.png"
  ```

  ```bash outpaint_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/outpaint \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "a mountain landscape",
          "size": "16:9",
          "zoom_out_percentage": 25.0,
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python outpaint.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/outpaint',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={
          'image': open('image.png', 'rb'),
      },
      body={
          'prompt': 'a mountain landscape',
          'size': '16:9',
          'zoom_out_percentage': 25.0,
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>

### Outpaint an image by Recraft V3 with per-side pixel margins

<CodeGroup>
  ```bash outpaint_expand.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/outpaint \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "prompt=a mountain landscape" \
      -F "expand_left=256" \
      -F "expand_right=256" \
      -F "expand_top=128" \
      -F "expand_bottom=128" \
      -F "image=@image.png"
  ```

  ```bash outpaint_expand_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/outpaint \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "a mountain landscape",
          "expand_left": 256,
          "expand_right": 256,
          "expand_top": 128,
          "expand_bottom": 128,
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python outpaint_expand.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/outpaint',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={
          'image': open('image.png', 'rb'),
      },
      body={
          'prompt': 'a mountain landscape',
          'expand_left': 256,
          'expand_right': 256,
          'expand_top': 128,
          'expand_bottom': 128,
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>

### Create own Recraft V3 style by uploading reference images and use them for generation

<CodeGroup>
  ```bash create_style_and_generate.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/styles \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "style=digital_illustration" \
      -F "file=@image.png"

  # response: {"id":"095b9f9d-f06f-4b4e-9bb2-d4f823203427"}

  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "wood potato masher",
          "style_id": "095b9f9d-f06f-4b4e-9bb2-d4f823203427"
      }'
  ```

  ```bash create_style_and_generate_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/styles \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "style": "digital_illustration",
          "image_urls": ["https://example.com/image.png"]
      }'

  # response: {"id":"095b9f9d-f06f-4b4e-9bb2-d4f823203427"}

  curl https://external.api.recraft.ai/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "wood potato masher",
          "style_id": "095b9f9d-f06f-4b4e-9bb2-d4f823203427"
      }'
  ```

  ```python create_style_and_generate.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  style = client.post(
      path='/styles',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      body={'style': 'digital_illustration'},
      files={'file': open('image.png', 'rb')},
  )
  print(style['id'])

  response = client.images.generate(
    prompt='wood potato masher',
    extra_body={'style_id': style['id']},
  )
  print(response.data[0].url)
  ```
</CodeGroup>

### Vectorize an image in PNG format

<CodeGroup>
  ```bash vectorize.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/vectorize \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "file=@image.png"
  ```

  ```bash vectorize_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/vectorize \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python vectorize.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/vectorize',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={'file': open('image.png', 'rb')},
  )
  print(response['image']['url'])
  ```
</CodeGroup>

### Remove background from a PNG image, get the result in B64 JSON

<CodeGroup>
  ```bash remove_background_b64.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/removeBackground \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "response_format=b64_json" \
      -F "file=@image.png"
  ```

  ```bash remove_background_b64_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/removeBackground \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "response_format": "b64_json",
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python remove_background_b64.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/removeBackground',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      body={'response_format': 'b64_json'},
      files={'file': open('image.png', 'rb')},
  )
  print(response['image']['url'])
  ```
</CodeGroup>

### Run crisp upscale tool for a PNG image, get the result in B64 JSON

<CodeGroup>
  ```bash crisp_upscale_b64.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/crispUpscale \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "response_format=b64_json" \
      -F "file=@image.png"
  ```

  ```bash crisp_upscale_b64_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/crispUpscale \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "response_format": "b64_json",
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python crisp_upscale_b64.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/crispUpscale',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      body={'response_format': 'b64_json'},
      files={'file': open('image.png', 'rb')},
  )
  print(response['image']['url'])
  ```
</CodeGroup>

### Run creative upscale tool for a PNG image

<CodeGroup>
  ```bash creative_upscale.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/creativeUpscale \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "file=@image.png"
  ```

  ```bash creative_upscale_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/creativeUpscale \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python creative_upscale.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/creativeUpscale',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      files={'file': open('image.png', 'rb')},
  )
  print(response['image']['url'])
  ```
</CodeGroup>

### Variate PNG image, get the result in WEBP format

<CodeGroup>
  ```bash variate_image.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/variateImage \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -F "response_format=url" \
      -F "size=1024x1024" \
      -F "n=1" \
      -F "seed=13191922" \
      -F "image_format=webp" \
      -F "file=@image.png"
  ```

  ```bash variate_image_json.sh theme={null}
  curl -X POST https://external.api.recraft.ai/v1/images/variateImage \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "response_format": "url",
          "size": "1024x1024",
          "n": 1,
          "seed": 13191922,
          "image_format": "webp",
          "image_url": "https://example.com/image.png"
      }'
  ```

  ```python variate_image.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/variateImage',
      cast_to=object,
      options={'headers': {'Content-Type': 'multipart/form-data'}},
      body={"size": "1024x1024", "n": 1, "response_format": "url", "seed": 13191922, "image_format": "webp"},
      files={'file': open('image.png', 'rb')},
  )
  print(response['data'][0]["url"])
  ```
</CodeGroup>

### Explore images

<CodeGroup>
  ```bash explore.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/explore \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "race car on a track",
          "model": "recraftv4"
      }'
  ```

  ```python explore.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/explore',
      cast_to=object,
      body={
          'prompt': 'race car on a track',
          'model': 'recraftv4',
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>

### Enhance a prompt

<CodeGroup>
  ```bash enhance_prompt.sh theme={null}
  curl https://external.api.recraft.ai/v1/prompts/enhance \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "prompt": "race car on a track"
      }'
  ```

  ```python enhance_prompt.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/prompts/enhance',
      cast_to=object,
      body={'prompt': 'race car on a track'},
  )
  print(response['enhanced_prompt'])
  ```
</CodeGroup>

### Explore similar images

<CodeGroup>
  ```bash explore_similar.sh theme={null}
  curl https://external.api.recraft.ai/v1/images/explore/similar \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RECRAFT_API_TOKEN" \
      -d '{
          "source_image_id": "c18a1988-45e7-4c00-82c4-4ad7d3dbce3a",
          "similarity": 3
      }'
  ```

  ```python explore_similar.py theme={null}
  from openai import OpenAI

  client = OpenAI(base_url='https://external.api.recraft.ai/v1', api_key=_RECRAFT_API_TOKEN)

  response = client.post(
      path='/images/explore/similar',
      cast_to=object,
      body={
          'source_image_id': 'c18a1988-45e7-4c00-82c4-4ad7d3dbce3a',
          'similarity': 3,
      },
  )
  print(response['data'][0]['url'])
  ```
</CodeGroup>
