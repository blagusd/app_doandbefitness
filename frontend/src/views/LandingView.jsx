import "./LandingView.css";
//import gymImg1 from "../assets/gym1.jpg";
import doroteaNaslovna from "../assets/dorotea-naslovna.png";
import gymImg2 from "../assets/gym2.jpeg";

function LandingView() {
  return (
    <main className="landing">
      <section className="row">
        <div className="col text wide">
          <h3 className="highlight">Umorni od bolova u leđima i zglobovima?</h3>
          <p className="accent">
            Dugi sati sjedenja i uredski posao iscrpljuju tijelo?
          </p>
          <p className="accent">
            Potrebna je motivacija i jasan plan treninga kako bi se pokrenuli i
            održali formu?
          </p>
          <p className="accent">
            Želite unaprijediti svoje zdravlje i prehranu?
          </p>
          <p className="story">
            <strong>Ja Vam mogu pomoći.</strong> Svi ovi izazovi su mi vrlo
            dobro poznati. Najviše sam ipak učila kroz vlastito iskustvo.{" "}
          </p>
          <p className="story">
            Svakoga očekuje <span className="emphasis">individualni plan</span>,
            savjeti uz prehranu i ono što me čini drugačijom ➡️
            <span className="emphasis">
              hrpa vježbi za mobilnost i opuštanje!
            </span>
          </p>
        </div>
        <div className="col image">
          <img src={doroteaNaslovna} alt="Dorotea" width="500" height="667" />
        </div>
        <div className="col text wide">
          <div className="col text wide">
            <h3 className="highlight">Što dobivate uz Do&BEFitness?</h3>

            <p className="check-line">
              {" "}
              Pristup vlastitoj stranici gdje se vježbe ažuriraju
              <span className="emphasis"> na tjednoj bazi</span>;
            </p>
            <p className="check-line">
              {" "}
              3 full‑body ili 4 treninga (2 gornji dio + 2 donji dio)
              <span className="emphasis"> ovisno o preferencijama</span>;
            </p>
            <p className="check-line">
              {" "}
              Praćenje napretka i analiza - tjelesna težina, napredak za svaku
              vježbu,<span className="emphasis"> sve vizualizirano</span>;
            </p>
            <p className="check-line">
              {" "}
              Savjeti vezani za prehranu + prijedlozi
              <span className="emphasis"> osobnih recepata</span>
            </p>

            <p className="story">
              <strong>Zainteresirani?</strong> Prijavite se već danas. Ispunite
              inicijalni upitnik, a dalje se dogovaramo oko detalja putem
              e‑maila.{" "}
            </p>
            <p className="story">
              Za sva pitanja uvijek sam dostupna, a tu je i
              <span className="emphasis"> Viber grupa </span> kojoj se
              pridružuju svi klijenti - namijenjena razmjeni iskustava i
              međusobnoj podršci.
            </p>
          </div>
        </div>
      </section>

      <p className="note">
        Treninzi su osmišljeni za izvođenje u teretani, a ukoliko se pokaže veći
        interes, napravit ćemo program i za kućne treninge.
      </p>
    </main>
  );
}

export default LandingView;
