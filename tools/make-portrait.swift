// ===========================================================================
// tools/make-portrait.swift
//
// Turns an original headshot into assets/portrait.jpg — the one file the hero
// photo slot in css/tokens.css points at.
//
//   Run from the repository root:
//     xcrun swift tools/make-portrait.swift assets/portrait-source.jpg
//
// Like tools/make-images.swift, this is NOT part of building the site. The
// site is plain static files with no build step. This exists only so the
// portrait can be remade from the original when the crop needs changing —
// edit the three fractions below and run it again.
//
// It uses only AppKit and CoreGraphics, which ship with macOS. Nothing is
// downloaded and nothing is installed.
// ===========================================================================

import AppKit

// --- the crop box, as fractions of the source ------------------------------
// Fractions rather than pixels, so the same numbers hold whatever resolution
// the original is.
//
// Tuned for a head-and-shoulders framing of the July 2026 headshot: it drops
// the dead space above the head, and it crops away the four-point watermark
// the AI retouching tool left in the bottom-right corner.
//
// The height is DERIVED from the width, so the output is always exactly 4:5 —
// the aspect ratio .plate__frame in css/components.css is built around. That
// means the photograph fills the frame with no further cropping by the
// browser, and --portrait-focus in css/tokens.css has nothing left to do.
let cropLeft  = 0.1911  // left edge, measured from the left of the source
let cropTop   = 0.1553  // top edge, measured from the top of the source
let cropWidth = 0.6421  // width; height follows at 5/4 of it

// --- output ----------------------------------------------------------------
// The plate is roughly 380–440 px wide on screen, so 800 px is comfortably
// past 2x for a high-density display without shipping a needlessly big file.
let outWidth      = 800
let outHeight     = 1000
let jpegQuality   = 0.92

// --- read ------------------------------------------------------------------
let args    = CommandLine.arguments
let srcPath = args.count > 1 ? args[1] : "assets/portrait-source.jpg"
let outPath = args.count > 2 ? args[2] : "assets/portrait.jpg"

func die(_ message: String) -> Never {
    FileHandle.standardError.write(Data("make-portrait: \(message)\n".utf8))
    exit(1)
}

guard let loaded = NSImage(contentsOfFile: srcPath) else {
    die("cannot read \(srcPath) — is the path right?")
}
guard let src = loaded.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    die("\(srcPath) is not an image this can decode")
}

// --- crop ------------------------------------------------------------------
// CGImage coordinates put (0, 0) at the TOP-left, which is the same way the
// fractions above are written.
let sw = CGFloat(src.width)
let sh = CGFloat(src.height)

var w = (sw * cropWidth).rounded()
var h = (w * 5 / 4).rounded()

// If the fractions are edited to something that will not fit, shrink the box
// rather than failing — a slightly tighter crop beats a crash.
if h > sh { h = sh; w = (h * 4 / 5).rounded() }
if w > sw { w = sw; h = (w * 5 / 4).rounded() }

let x = min(max(0, (sw * cropLeft).rounded()), sw - w)
let y = min(max(0, (sh * cropTop).rounded()), sh - h)

guard let cropped = src.cropping(to: CGRect(x: x, y: y, width: w, height: h)) else {
    die("crop box \(Int(w))x\(Int(h)) at \(Int(x)),\(Int(y)) fell outside the image")
}

// --- resize and write ------------------------------------------------------
// noneSkipLast: a JPEG has no alpha channel, and the photograph is opaque.
let space = CGColorSpace(name: CGColorSpace.sRGB)!
guard let ctx = CGContext(data: nil, width: outWidth, height: outHeight,
                          bitsPerComponent: 8, bytesPerRow: 0, space: space,
                          bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
    die("could not open a \(outWidth)x\(outHeight) drawing context")
}
ctx.interpolationQuality = .high
ctx.draw(cropped, in: CGRect(x: 0, y: 0, width: outWidth, height: outHeight))

guard let out = ctx.makeImage() else { die("could not render the resized image") }

let rep = NSBitmapImageRep(cgImage: out)
guard let jpeg = rep.representation(using: .jpeg,
                                    properties: [.compressionFactor: jpegQuality]) else {
    die("could not encode JPEG")
}

do {
    try jpeg.write(to: URL(fileURLWithPath: outPath))
} catch {
    die("could not write \(outPath): \(error.localizedDescription)")
}

let kb = (jpeg.count + 512) / 1024
print("""
      make-portrait: \(srcPath)  \(Int(sw))x\(Int(sh))
                  -> \(outPath)  \(outWidth)x\(outHeight), \(kb) KB
                     cropped \(Int(w))x\(Int(h)) from \(Int(x)),\(Int(y))
      """)
