# Live2D 22/33 — attribution

Assets adapted from `xb2016/poster-girl-l2d-2233`, commit
`6fca7999e2c865a55b795a96b911aa4018e0060b`, distributed under GPL-2.0.
The upstream project states that the 22/33 characters are owned by Bilibili.
Only the non-adult `default.v2` outfit is included here.

Local mapping:

- `model/22/22.v2.moc` -> `models/22/22.v2.moc`
- `model/22/texture_00.png` and `model/22/closet.default.v2/*` -> `models/22/textures/*`
- `model/22/*.mtn` -> `models/22/motions/*`
- `model/33/33.v2.moc` -> `models/33/33.v2.moc`
- `model/33/texture_00.png` and `model/33/closet.default.v2/*` -> `models/33/textures/*`
- `model/33/*.mtn` -> `models/33/motions/*`

The local `model.json` files are static equivalents of the upstream PHP model
manifest, restricted to the assets listed above. Model binaries and textures
are byte-identical to that upstream commit; integrity is enforced by tests.

The local Cubism 2 runtime originates from the GPL-2.0 `journey-ad/live2d_src`
lineage used by the upstream project. No runtime or model is hotlinked.

See `LICENSE-GPL-2.0.txt` in this directory.
