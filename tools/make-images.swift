// ===========================================================================
// tools/make-images.swift
//
// Regenerates the two PNGs in assets/ so they match the site design:
//
//   assets/og-image.png         1200 x 630   social preview
//   assets/apple-touch-icon.png  180 x 180   opaque, no alpha channel
//
// This is NOT part of building the site. The site is plain static files with
// no build step; this script only exists so the images can be remade if the
// colours or wording change.
//
//   Run from the repository root:   xcrun swift tools/make-images.swift
//
// It uses only AppKit and CoreGraphics, which ship with macOS. Nothing is
// downloaded and nothing is installed.
// ===========================================================================

import AppKit
import CoreGraphics

// --- palette, copied from css/tokens.css -----------------------------------
let paper   = NSColor(srgbRed: 0.980, green: 0.976, blue: 0.969, alpha: 1) // #FAF9F7
let ink     = NSColor(srgbRed: 0.086, green: 0.094, blue: 0.102, alpha: 1) // #16181A
let ink2    = NSColor(srgbRed: 0.180, green: 0.196, blue: 0.212, alpha: 1) // #2E3236
let ink3    = NSColor(srgbRed: 0.353, green: 0.376, blue: 0.408, alpha: 1) // #5A6068
let accent  = NSColor(srgbRed: 0.071, green: 0.251, blue: 0.420, alpha: 1) // #12406B
let rule    = NSColor(srgbRed: 0.886, green: 0.871, blue: 0.843, alpha: 1) // #E2DED7
let panel   = NSColor(srgbRed: 0.055, green: 0.141, blue: 0.216, alpha: 1) // #0E2437
let panelHi = NSColor(srgbRed: 0.067, green: 0.188, blue: 0.286, alpha: 1) // #113049
let onPanel = NSColor(srgbRed: 0.910, green: 0.929, blue: 0.949, alpha: 1) // #E8EDF2
let onPanel2 = NSColor(srgbRed: 0.663, green: 0.737, blue: 0.800, alpha: 1) // #A9BCCC
let panelLine = NSColor(srgbRed: 0.561, green: 0.706, blue: 0.831, alpha: 1) // #8FB4D4
let panelFlag = NSColor(srgbRed: 0.894, green: 0.443, blue: 0.306, alpha: 1) // #E4714E

// --- fonts: the same families the stylesheet asks for ----------------------
func serif(_ size: CGFloat, _ weight: NSFont.Weight = .semibold) -> NSFont {
    for name in ["Iowan Old Style", "Palatino", "Georgia", "Times New Roman"] {
        if let f = NSFont(name: weight == .regular ? name : "\(name) Bold", size: size) { return f }
        if let f = NSFont(name: name, size: size) { return f }
    }
    return NSFont.systemFont(ofSize: size, weight: weight)
}
func mono(_ size: CGFloat, _ weight: NSFont.Weight = .medium) -> NSFont {
    return NSFont.monospacedSystemFont(ofSize: size, weight: weight)
}
func sans(_ size: CGFloat, _ weight: NSFont.Weight = .regular) -> NSFont {
    return NSFont.systemFont(ofSize: size, weight: weight)
}

func draw(_ s: String, _ font: NSFont, _ color: NSColor, at p: CGPoint,
          tracking: CGFloat = 0, width: CGFloat = 0, lineHeight: CGFloat = 0) {
    let para = NSMutableParagraphStyle()
    if lineHeight > 0 { para.minimumLineHeight = lineHeight; para.maximumLineHeight = lineHeight }
    var attrs: [NSAttributedString.Key: Any] = [
        .font: font, .foregroundColor: color, .paragraphStyle: para
    ]
    if tracking != 0 { attrs[.kern] = tracking }
    let a = NSAttributedString(string: s, attributes: attrs)
    if width > 0 {
        a.draw(with: CGRect(x: p.x, y: p.y, width: width, height: 400),
               options: [.usesLineFragmentOrigin])
    } else {
        a.draw(at: p)
    }
}

func makeContext(_ w: Int, _ h: Int, opaqueBackground: NSColor) -> (CGContext, NSGraphicsContext) {
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    let cg = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                       space: cs, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    cg.setFillColor(opaqueBackground.cgColor)
    cg.fill(CGRect(x: 0, y: 0, width: w, height: h))
    // Flip the CTM so everything below — CoreGraphics shapes and AppKit text
    // alike — uses a top-left origin, the same as CSS.
    cg.translateBy(x: 0, y: CGFloat(h))
    cg.scaleBy(x: 1, y: -1)
    let ns = NSGraphicsContext(cgContext: cg, flipped: true)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = ns
    return (cg, ns)
}

func write(_ cg: CGContext, to path: String) {
    NSGraphicsContext.restoreGraphicsState()
    let img = cg.makeImage()!
    let url = URL(fileURLWithPath: path) as CFURL
    let dest = CGImageDestinationCreateWithURL(url, "public.png" as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, img, nil)
    CGImageDestinationFinalize(dest)
    print("wrote \(path)  \(cg.width)x\(cg.height)")
}

// The valuation curve, in its own 0…1 space (same shape as the one on the page).
func curvePoints(_ n: Int) -> [CGPoint] {
    let f = 5.897, r = 0.12, gmin = 0.070, gmax = 0.1045
    let vmin = 100.0, vmax = 450.0
    return (0...n).map { i -> CGPoint in
        let g = gmin + (gmax - gmin) * Double(i) / Double(n)
        let v = f * (1 + g) / (r - g)
        return CGPoint(x: CGFloat(Double(i) / Double(n)),
                       y: CGFloat((v - vmin) / (vmax - vmin)))
    }
}

/// Draws the dark plate: gradient, grid, area, curve, marker.
func drawPlate(_ cg: CGContext, rect: CGRect, radius: CGFloat, detail: Bool) {
    cg.saveGState()
    let clip = CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
    cg.addPath(clip); cg.clip()

    let grad = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
                          colors: [panelHi.cgColor, panel.cgColor] as CFArray,
                          locations: [0, 1])!
    cg.drawLinearGradient(grad, start: CGPoint(x: rect.maxX, y: rect.minY),
                          end: CGPoint(x: rect.minX, y: rect.maxY), options: [])

    // graph paper
    cg.setStrokeColor(onPanel.withAlphaComponent(0.085).cgColor)
    cg.setLineWidth(1)
    for i in 1..<7 {
        let y = rect.minY + rect.height * CGFloat(i) / 7
        cg.move(to: CGPoint(x: rect.minX, y: y)); cg.addLine(to: CGPoint(x: rect.maxX, y: y))
    }
    for i in 1..<6 {
        let x = rect.minX + rect.width * CGFloat(i) / 6
        cg.move(to: CGPoint(x: x, y: rect.minY)); cg.addLine(to: CGPoint(x: x, y: rect.maxY))
    }
    cg.strokePath()

    // curve: occupies the top 62% of the plate, area falls to the base
    let pts = curvePoints(40)
    let plotTop = rect.minY + rect.height * 0.12
    let plotBottom = rect.minY + rect.height * 0.60
    func P(_ p: CGPoint) -> CGPoint {
        CGPoint(x: rect.minX + p.x * rect.width,
                y: plotBottom - p.y * (plotBottom - plotTop))
    }
    let path = CGMutablePath()
    path.move(to: P(pts[0]))
    for p in pts.dropFirst() { path.addLine(to: P(p)) }

    let area = CGMutablePath()
    area.addPath(path)
    area.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
    area.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
    area.closeSubpath()
    cg.addPath(area)
    cg.setFillColor(panelLine.withAlphaComponent(0.17).cgColor)
    cg.fillPath()

    cg.addPath(path)
    cg.setStrokeColor(panelLine.cgColor)
    cg.setLineWidth(max(2, rect.width / 150))
    cg.setLineJoin(.round); cg.setLineCap(.round)
    cg.strokePath()

    if detail {
        // prior-price reference line
        let yRef = plotBottom - CGFloat((239.89 - 100) / 350) * (plotBottom - plotTop)
        cg.setStrokeColor(onPanel.withAlphaComponent(0.4).cgColor)
        cg.setLineWidth(1); cg.setLineDash(phase: 0, lengths: [4, 4])
        cg.move(to: CGPoint(x: rect.minX, y: yRef)); cg.addLine(to: CGPoint(x: rect.maxX, y: yRef))
        cg.strokePath(); cg.setLineDash(phase: 0, lengths: [])

        // base-case marker at g = 9.84%
        let t = CGFloat((0.0984 - 0.070) / (0.1045 - 0.070))
        let vBase = 5.897 * (1 + 0.0984) / (0.12 - 0.0984)
        let dot = CGPoint(x: rect.minX + t * rect.width,
                          y: plotBottom - CGFloat((vBase - 100) / 350) * (plotBottom - plotTop))
        cg.setFillColor(panel.cgColor)
        cg.fillEllipse(in: CGRect(x: dot.x - 9, y: dot.y - 9, width: 18, height: 18))
        cg.setFillColor(panelFlag.cgColor)
        cg.fillEllipse(in: CGRect(x: dot.x - 6, y: dot.y - 6, width: 12, height: 12))

        draw("IMPLIED VALUE", mono(13, .medium), onPanel2,
             at: CGPoint(x: rect.minX + 22, y: rect.minY + 20), tracking: 1.6)
        draw("AGAINST GROWTH RATE", mono(13, .medium), onPanel2.withAlphaComponent(0.72),
             at: CGPoint(x: rect.minX + 22, y: rect.minY + 40), tracking: 1.6)
        draw("PRIOR $239.89", mono(13, .medium), onPanel2.withAlphaComponent(0.72),
             at: CGPoint(x: rect.minX + 22, y: yRef - 22), tracking: 1.6)
        draw("g = 9.84% · $299.87", mono(14, .semibold), panelFlag,
             at: CGPoint(x: dot.x - 190, y: dot.y - 34))

        // nameplate
        let plateFoot = rect.maxY - 112
        cg.setStrokeColor(onPanel.withAlphaComponent(0.22).cgColor)
        cg.setLineWidth(1)
        cg.move(to: CGPoint(x: rect.minX + 22, y: plateFoot))
        cg.addLine(to: CGPoint(x: rect.maxX - 22, y: plateFoot))
        cg.strokePath()
        draw("UNIVERSITY OF NEW HAVEN", mono(12, .medium), panelLine,
             at: CGPoint(x: rect.minX + 22, y: plateFoot + 16), tracking: 1.4)
        draw("MBA — Financial Analysis", serif(23), onPanel,
             at: CGPoint(x: rect.minX + 22, y: plateFoot + 38))
        draw("GPA 3.90 / 4.00", mono(15, .semibold), onPanel,
             at: CGPoint(x: rect.minX + 22, y: plateFoot + 74))
    }

    // engraved inner frame
    cg.setStrokeColor(onPanel.withAlphaComponent(0.16).cgColor)
    cg.setLineWidth(2)
    cg.addPath(CGPath(roundedRect: rect.insetBy(dx: 1, dy: 1), cornerWidth: radius, cornerHeight: radius, transform: nil))
    cg.strokePath()
    cg.setStrokeColor(onPanel.withAlphaComponent(0.10).cgColor)
    cg.setLineWidth(1)
    cg.addPath(CGPath(roundedRect: rect.insetBy(dx: 10, dy: 10), cornerWidth: 2, cornerHeight: 2, transform: nil))
    cg.strokePath()

    cg.restoreGState()
}

// ===========================================================================
// 1. Open Graph image — 1200 x 630
// ===========================================================================
do {
    let W = 1200, H = 630
    let (cg, _) = makeContext(W, H, opaqueBackground: paper)

    // top accent rule
    cg.setFillColor(accent.cgColor)
    cg.fill(CGRect(x: 0, y: 0, width: W, height: 8))

    let x: CGFloat = 76
    let right: CGFloat = 700

    func widthOf(_ str: String, _ f: NSFont, _ tracking: CGFloat) -> CGFloat {
        NSAttributedString(string: str, attributes: [.font: f, .kern: tracking]).size().width
    }
    func hairline(_ y: CGFloat) {
        cg.setStrokeColor(rule.cgColor); cg.setLineWidth(1)
        cg.move(to: CGPoint(x: x, y: y)); cg.addLine(to: CGPoint(x: right, y: y)); cg.strokePath()
    }

    let kicker = "FINANCIAL ANALYST"
    draw(kicker, mono(17, .medium), accent, at: CGPoint(x: x, y: 88), tracking: 2.4)
    draw("\u{00B7} WEST HAVEN, CONNECTICUT", mono(17, .medium), ink3,
         at: CGPoint(x: x + widthOf(kicker, mono(17, .medium), 2.4) + 14, y: 88), tracking: 2.4)

    draw("Prishida Khatri", serif(92), ink, at: CGPoint(x: x - 4, y: 122))

    draw("FP&A, forecasting, equity valuation and the dashboards that make them legible.",
         serif(31, .regular), ink2, at: CGPoint(x: x, y: 264), width: 612, lineHeight: 44)

    hairline(388)

    let facts = [("DEGREE", "MBA, Financial Analysis"),
                 ("GRADE", "3.90 / 4.00"),
                 ("TOOLKIT", "Excel \u{00B7} SQL \u{00B7} Power BI \u{00B7} R")]
    var fx: CGFloat = x
    for (i, f) in facts.enumerated() {
        if i > 0 {
            cg.setStrokeColor(rule.cgColor); cg.setLineWidth(1)
            cg.move(to: CGPoint(x: fx - 24, y: 408)); cg.addLine(to: CGPoint(x: fx - 24, y: 464)); cg.strokePath()
        }
        draw(f.0, mono(13, .medium), ink3, at: CGPoint(x: fx, y: 410), tracking: 1.6)
        draw(f.1, sans(18, .semibold), ink, at: CGPoint(x: fx, y: 434))
        fx += max(widthOf(f.0, mono(13, .medium), 1.6), widthOf(f.1, sans(18, .semibold), 0)) + 48
    }

    hairline(500)
    draw("khatriprishida.github.io", mono(17, .medium), accent, at: CGPoint(x: x, y: 522), tracking: 0.6)

    drawPlate(cg, rect: CGRect(x: 764, y: 72, width: 364, height: 486), radius: 4, detail: true)

    write(cg, to: "assets/og-image.png")
}

// ===========================================================================
// 2. Apple touch icon — 180 x 180, fully opaque
// ===========================================================================
do {
    let S = 180
    let (cg, _) = makeContext(S, S, opaqueBackground: panel)
    drawPlate(cg, rect: CGRect(x: 0, y: 0, width: S, height: S), radius: 0, detail: false)
    let para = NSMutableParagraphStyle(); para.alignment = .center
    let a = NSAttributedString(string: "PK", attributes: [
        .font: serif(84), .foregroundColor: onPanel, .paragraphStyle: para, .kern: 1.0
    ])
    a.draw(with: CGRect(x: 0, y: 44, width: CGFloat(S), height: 110), options: [.usesLineFragmentOrigin])
    write(cg, to: "assets/apple-touch-icon.png")
}
