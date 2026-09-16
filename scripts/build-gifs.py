from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FRAME_ROOT = ROOT / "artifacts" / "demo-frames"
OUTPUT = ROOT / "public" / "demos"
OUTPUT.mkdir(parents=True, exist_ok=True)


def build(source: Path, destination: Path) -> None:
    paths = sorted(source.glob("*.png"))
    if not paths:
        raise RuntimeError(f"No frames found in {source}")

    # One shared palette prevents color flicker between frames. A contact sheet
    # of samples captures every state without making palette generation huge.
    samples = paths[:: max(1, len(paths) // 20)][:20]
    thumbs = []
    for sample in samples:
        image = Image.open(sample).convert("RGB")
        image.thumbnail((231, 470))
        thumbs.append(image.copy())
        image.close()
    sheet = Image.new("RGB", (231 * 5, 470 * 4), "#703cff")
    for index, image in enumerate(thumbs):
        sheet.paste(image, ((index % 5) * 231, (index // 5) * 470))
    palette = sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT)

    frames = []
    for frame_path in paths:
        with Image.open(frame_path) as image:
            frames.append(
                image.convert("RGB").quantize(
                    palette=palette,
                    dither=Image.Dither.NONE,
                )
            )

    frames[0].save(
        destination,
        save_all=True,
        append_images=frames[1:],
        duration=83,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"{destination.name}: {len(frames)} frames, {destination.stat().st_size / 1024 / 1024:.2f} MiB")


build(FRAME_ROOT / "01-time-and-physics", OUTPUT / "01-time-and-physics.gif")
build(FRAME_ROOT / "02-world-palettes", OUTPUT / "02-world-palettes.gif")
