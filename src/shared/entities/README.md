# Design decisions

This module is tightly coupled with Pixi.js logic. I found there was no point in injecting the package, as if I expected these entities to be reusable with other packages (most will not be reusable anyways).
