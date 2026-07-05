# Portfolio transcription — verification checklist

The portfolio data in `src/data/portfolio.ts` was transcribed **by eye** from
high-DPI renders of `化工流程图.pdf` (the PDF has no text layer, so nothing
could be parsed automatically). The overall structure and the great majority
of ~230 nodes are confident. Below are the spots where I inferred, where labels
were tiny, or where a parent→child link was ambiguous from how the connector
lines routed. Please check these against the PDF and tell me any corrections —
each is a one-line fix in the data file.

Legend colours used: **daily** = yellow (core traded), **tracked** = blue
(extended coverage), **unit** = feedstock/process box, **app** = white end-use.

## High-value checks (structure)

1. **Plasticizers (DOP / DBP / DIBP / DINP / DOTP).** I linked these under both
   Acrylic Acid and Phthalic Anhydride (PA). In reality phthalate plasticizers
   (DOP/DINP/DIBP) come from **PA + alcohols**, while acrylic esters are a
   separate branch. Confirm which plasticizers hang off PA vs Acrylic Acid.

2. **PU resin (聚氨酯浆料/鞋底原液).** I gave it two parents: Adipic Acid and
   Pure MDI. The **Adipic → PU resin** link is suspect — PU resin normally comes
   from MDI/polyols. Confirm whether Adipic → PU resin should be removed.

3. **BDO parents.** Linked to Maleic Anhydride, Formaldehyde, and Adipic Acid.
   The **Adipic → BDO** link is the doubtful one. Confirm.

4. **Styrene (SM) parents.** Linked to Ethylene, Benzene, and Refined Benzene.
   Standard route is Ethylene + Benzene (ethylbenzene). Confirm the
   Refined-Benzene link isn't a double-count.

5. **Refined Benzene branch (精致苯 → Aniline / Cyclohexanone / Cyclohexane /
   SM).** This overlaps the crude-oil Benzene branch. Confirm these coal-tar
   links are real and not accidental duplicates of the petro-benzene branch.

6. **Acetic Acid (冰醋酸).** I placed it downstream of Methanol. Confirm it
   isn't meant to be its own feedstock node in the C1 cluster.

7. **MTBE.** Linked to both Mixed C4 and Methanol (isobutene + methanol).
   Confirm both parents are intended.

8. **PBT.** Linked to PTA and BDO. Confirm (PBT = PTA + BDO, so both should
   stay — just verify).

9. **MDI.** Linked to Aniline and Formaldehyde. Confirm both.

10. **Ammonium Sulphate (硫铵) from Coke Oven Gas.** Confirm the parent.

## Label / detail checks (tiny text)

11. **Semi-coke vs coke.** 兰炭 (semi-coke, "coke2" → Calcium Carbide) vs 焦炭
    (coke → Coal Tar). Confirm both exist and feed what I have.

12. **Glycerine / Fatty Acids downstream.** I collapsed their targets into one
    "UPR / Alkyd Resin" node. The PDF lists Alkyd Resin, Daily Chemicals &
    Medicine, Rubber, Plastic separately — say if you want them split out.

13. **Coverage colours.** A handful of nodes near borders were ambiguous
    yellow-vs-blue (e.g., Kerosene, Gasoline cuts, DBP/DIBP, PMMA, THF, PTMEG,
    Paraffin). Skim the yellow/blue split and flag any that look wrong.

## Approximate section

14. **Paper flowchart edges.** The specific pulp→paper-grade links (e.g.,
    Bagasse→Tissue, Straw→Office, Reed→Packaging) are my inference — the PDF
    routes several pulps into the paper categories and the exact mapping was
    hard to read. Treat the whole paper-diagram edge set as approximate and
    correct freely.

15. **Densest right-edge cluster (polyester / MDI / spandex).** Bottle vs Fiber
    PET chip, PFY/PSF, Polymeric vs Pure MDI, Spandex, PTMEG — this was the
    smallest, most crowded region. Worth a direct side-by-side check.

---

**How to send corrections:** just tell me e.g. "remove Adipic→BDO", "SM
shouldn't link to Refined Benzene", "split Glycerine into Alkyd + Rubber +
Plastic" — I'll apply them directly to `src/data/portfolio.ts`.
