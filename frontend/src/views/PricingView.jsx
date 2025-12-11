import "./PricingView.css";

function PricingView() {
  return (
    <main className="pricing">
      <h2>Cjenik</h2>
      <table className="pricing-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Trajanje</th>
            <th>Cijena</th>
            <th>Pogodnosti</th>
          </tr>
        </thead>
        <tbody>
          <tr className="basic">
            <td>Osnovni</td>
            <td>1 mjesec</td>
            <td>
              <b>39</b> €
            </td>
            <td>Tjedni plan programa, savjeti za prehranu, chat podrška</td>
          </tr>
          <tr className="student">
            <td>Studentski</td>
            <td>1 mjesec</td>
            <td>
              <b>33</b> € (15% popusta)
            </td>
            <td>Isto kao osnovni plan, uz studentski popust</td>
          </tr>
          <tr className="pro">
            <td>Paket</td>
            <td>3 mjeseca</td>
            <td>
              <b>105</b> € (10% popusta)
            </td>
            <td>Tjedni plan, prehrana, chat, dugoročniji program</td>
          </tr>
          <tr className="elite">
            <td>Paket</td>
            <td>6 mjeseci</td>
            <td>
              <b>199</b> € (15% popusta)
            </td>
            <td>Tjedni plan, prehrana, chat, dugoročni program</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}

export default PricingView;
