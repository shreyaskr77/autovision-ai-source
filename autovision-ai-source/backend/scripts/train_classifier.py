"""Fine-tune a make/model classifier on a folder-per-class dataset.

Expected layout:
  data/stanford-cars/train/<make-model>/*.jpg
  data/stanford-cars/val/<make-model>/*.jpg

This script does not download data and does not claim accuracy. Keep the
dataset licence and the resulting evaluation report with the model weights.
"""

import argparse
from pathlib import Path

import torch
from torchvision import datasets, models, transforms


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("models/vehicle-classifier.pt"))
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )
    train = datasets.ImageFolder(args.data_dir / "train", transform=transform)
    validation = datasets.ImageFolder(args.data_dir / "val", transform=transform)
    loader = torch.utils.data.DataLoader(train, batch_size=args.batch_size, shuffle=True)
    validation_loader = torch.utils.data.DataLoader(validation, batch_size=args.batch_size)

    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(train.classes))
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
    loss_fn = torch.nn.CrossEntropyLoss()

    for epoch in range(args.epochs):
        model.train()
        for images, labels in loader:
            optimizer.zero_grad()
            loss_fn(model(images), labels).backward()
            optimizer.step()
        print(f"epoch={epoch + 1} validation_samples={len(validation_loader.dataset)}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "state_dict": model.state_dict(),
            "classes": train.classes,
            "dataset": "User-prepared ImageFolder dataset",
        },
        args.output,
    )
    print(f"saved={args.output} classes={len(train.classes)}")


if __name__ == "__main__":
    main()