import React, { useEffect, useState, useContext } from 'react';
import { useNavigate , useParams } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLegend } from 'victory';
import axios from 'axios';
import { config } from "../config";
import { KPIService } from '../services/KPIService';
import { MyBlogContext } from '../MyBlogContext';

interface EquipeInfo {
 id_equipe: string;
 jour: number;
 q_prod_caps_magique: number;
 q_prod_boite_magique: number;
 q_vendu_boite_magique: number;
 q_commande_raisin: number;
 q_commande_pomme: number;
 q_commande_carton: number;
 commande_client: number;
 stock_raisin: number;
 stock_apple: number;
 stock_carton: number;
 profits: number;
 co2_emissions: number;
}

export function KPIPageALLTeam() {
const { admin } = useContext(MyBlogContext);
 const kpiService = new KPIService(config.API_URL);  
 const navigate = useNavigate();
 const { idPartie, NomPartie } = useParams();
 const id = "100";
 const [checkboxValues, setCheckboxValues] = useState(Array(12).fill(false));
 const [checkboxNames, setCheckboxNames] = useState([
    'q_prod_caps_magique',
    'q_prod_boite_magique',
    'q_vendu_boite_magique',
    'q_commande_raisin',
    'q_commande_pomme',
    'q_commande_carton',
    'commande_client',
    'stock_raisin',
    'stock_apple',
    'stock_carton',
    'profits',
    'co2_emissions',
 ]);
 const [data, setData] = useState<Record<string, EquipeInfo[]>>({});

useEffect(() => {
  idPartie && kpiService.get_all_equipe_info(parseInt(id)).then((u) => {
      let prevDayRaisinStock = 2000;
      let prevDayAppleStock = 2000;
      let prevDayCartonStock = 30; // Stock initial de carton
      let prevDayCo2Emissions = 0; // Émissions de CO2 initiales
      for (let i = 0; i < u.data.equipe_infos.length; i++) {
        const teamId = u.data.equipe_infos[i].id_equipe;
        if (!data[teamId]) {
           data[teamId] = [];
        }

        // Calcul du stock de raisin
        let raisinStock = prevDayRaisinStock + u.data.equipe_infos[i].q_commande_raisin - 10 * u.data.equipe_infos[i].q_prod_caps_magique;
        raisinStock = Math.max(0, raisinStock);
        u.data.equipe_infos[i].stock_raisin = raisinStock;
        prevDayRaisinStock = raisinStock;

        // Calcul du stock de pommes
        let appleStock = prevDayAppleStock + u.data.equipe_infos[i].q_commande_pomme - 10 * u.data.equipe_infos[i].q_prod_caps_magique;
        appleStock = Math.max(0, appleStock);
        u.data.equipe_infos[i].stock_apple = appleStock;
        prevDayAppleStock = appleStock;

        // Calcul du stock de carton
        let cartonStock = prevDayCartonStock + u.data.equipe_infos[i].q_commande_carton - 2 * u.data.equipe_infos[i].q_prod_boite_magique;
        cartonStock = Math.max(0, cartonStock);
        u.data.equipe_infos[i].stock_carton = cartonStock;
        prevDayCartonStock = cartonStock;

        // Calcul des bénéfices
        const deliverValue = u.data.equipe_infos[i].q_commande_carton * 200;
        const stockRaisinValue = u.data.equipe_infos[i].stock_raisin * 0.2;
        const stockPommeValue = u.data.equipe_infos[i].stock_apple * 0.2;
        const stockCartonValue = u.data.equipe_infos[i].stock_carton * 0.2;
        const commandValue = u.data.equipe_infos[i].q_commande_carton > 0 ? -500 : 0;
        const quantityCommandedRaisinValue = u.data.equipe_infos[i].q_commande_raisin * 0.05;
        const quantityCommandedPommeValue = u.data.equipe_infos[i].q_commande_pomme * 0.05;
        const quantityCommandedCartonValue = u.data.equipe_infos[i].q_commande_carton * 0.2;
        const constantValue = -200;
        const profits = deliverValue - stockRaisinValue - stockPommeValue - stockCartonValue + commandValue - quantityCommandedRaisinValue - quantityCommandedPommeValue - quantityCommandedCartonValue + constantValue;
        u.data.equipe_infos[i].profits = profits;

        // Calcul des émissions de CO2
        let co2Emissions = prevDayCo2Emissions + u.data.equipe_infos[i].q_commande_carton * 100;
        u.data.equipe_infos[i].co2_emissions = co2Emissions;
        prevDayCo2Emissions = co2Emissions;

        data[teamId].push(u.data.equipe_infos[i]);
      }
      setData(data);

    }).catch(error => {
      console.error("Erreur lors de la récupération des données:", error);
    });
 }, []);

 const handleCheckboxChange = (index : number) => {
    const newCheckboxValues = [...checkboxValues];
    newCheckboxValues[index] = !newCheckboxValues[index];
    setCheckboxValues(newCheckboxValues);
 };

 const handleClosePage = (idPartie : number ,NomPartie :string ) => {

    navigate(`/partie-equipes/${idPartie}/${NomPartie}`); 
 };

 const colors = ["#c43a31", "#4f86f7", "#8a2be2", "#ffa500", "#20b2aa", "#ff6347", "#800080"];

 const getSelectedData = () => {
  return Object.entries(data).flatMap(([teamId, teamData]) =>
     checkboxNames
       .filter((_, index) => checkboxValues[index])
       .map(key => ({
         key,
         data: teamData.map(item => ({
           day: item.jour,
           quantity: item[key as keyof EquipeInfo] || 0,
         })),
         teamId,
       }))
  );
 };
 
// Créez un objet qui lie chaque équipe à sa couleur correspondante
const teamColorMap: Record<string, string> = {};
getSelectedData().forEach((series, index) => {
 teamColorMap[series.teamId] = colors[index % colors.length];
});


// ...

return (
  <div>
      <h2> KPI à visualiser : </h2>
 
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '200px' }}>
          {checkboxNames.map((name, index) => (
            <div key={index}>
              <label style={{ fontSize: '1.2em' }}> {/* Augmenter la taille du texte */}
                <input
                  type="checkbox"
                  checked={checkboxValues[index]}
                  onChange={() => handleCheckboxChange(index)}
                />
                {name}
              </label>
            </div>
          ))}
        </div>
 
        <div>
          <VictoryChart theme={VictoryTheme.material} domainPadding={10} width={800} height={400}> {/* Augmenter la taille du graphique */}
            <VictoryAxis
              tickValues={Object.values(data).flatMap(teamData => teamData.map(item => item.jour))}
              tickFormat={Object.values(data).flatMap(teamData => teamData.map(item => `Jour ${item.jour}`))}
            />
            <VictoryAxis dependentAxis tickFormat={(x) => (`${x}`)} />
 
            {
              getSelectedData().map((series, index) => (
                <VictoryLine
                  key={`${series.teamId}-${series.key}`}
                  data={series.data}
                  x="day"
                  y="quantity"
                  style={{
                  data: { stroke: colors[index % colors.length] },
                  parent: { border: "1px solid #ccc"}
                  }}
                />
              ))
            }
 
            <VictoryLegend
              x={10}
              y={10}
              orientation="horizontal"
              gutter={20}
              data={getSelectedData().map(series => ({ name: series.teamId, symbol: { fill: teamColorMap[series.teamId], type: "square" } }))}
            />
          </VictoryChart>
        </div>
      </div>
      <button onClick={() => {
            if (idPartie && NomPartie) {
                handleClosePage(parseInt(idPartie), NomPartie);
            }
            }} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '1.5em' }}>
           Retour
      </button>
  </div>
 );
 
 // ...
 
 
}

export default KPIPageALLTeam;
