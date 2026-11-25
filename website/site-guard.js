/* Informational purchase guidance only; no blanket 18+ restriction or DOB collection. */
(()=> {
  const path=window.location.pathname.toLowerCase();
  if(!path.endsWith("checkout.html")) return;
  const show=()=>{
    const form=document.getElementById("preview-form");
    if(!form || document.getElementById("age-guidance-note")) return;
    const note=document.createElement("aside");
    note.id="age-guidance-note"; note.className="policy-consent"; note.setAttribute("role","note");
    note.innerHTML='<span aria-hidden="true">ⓘ</span><span><strong>Buying for a younger player?</strong><br>If you are under 18, ask a parent or guardian to review the purchase and help you before any real payment is made. This preview does not verify anyone’s age.</span>';
    form.prepend(note);
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",show,{once:true}); else show();
})();