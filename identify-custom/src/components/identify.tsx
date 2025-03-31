import { React, appActions, getAppStore } from "jimu-core";
import Feature from "esri/widgets/Feature";
import Handles from "esri/core/Handles";
import Results from "./results";

const { useRef, useState, useEffect } = React;

const Identify = (props) => {
  //Clears any highlights created by this widget
  const clearHighlights = () => {
    // console.log("Before clearing highlights:", highlights.current.length) ////////////////////////////////////
    for (let i = 0; i < highlights.current.length; i++) {
      highlights.current[i].remove();
    }
    highlights.current = [];
  };

  //This call to clearHighlights may not be necessary
  try {
    clearHighlights();
  } catch {
    //Do nothing
  }

  const highlights = useRef([]);
  const tempHtmlPackages = useRef([]);
  const [htmlPackages, setHtmlPackages] = useState([]);

  const event = props.event;
  const featureContainer = props.featureContainer;
  const view = props.mapView.view;
  const sidebarId = props.sidebarId;
  let highlighted = false;

  //When switch clicked off remove highlights and clear results panel
  useEffect(() => {
    if (!props.on) {
      clearHighlights();
      tempHtmlPackages.current = [];
      setHtmlPackages(tempHtmlPackages.current);
    }
  }, [props.on]);

  //When a new event occurs clear the old highlights and fetch the new features
  useEffect(() => {
    view.popup.fetchFeatures(event).then(async (response) => {
      clearHighlights();
      tempHtmlPackages.current = [];
      let handles = new Handles();
      //await features before proceeding
      const data = await response.allGraphicsPromise;
      const layers = [];
      if (data.length > 0) {
        //Loop through results and find all the unique layers
        for (let i = 0; i < data.length; i++) {
          if (i === 0) {
            layers.push(data[i].layer);
          } else if (!layers.includes(data[i].layer)) {
            layers.push(data[i].layer);
          }
        }
        //Loop through the layers.
        layers.forEach(async (layer, i) => {
          const layerView = await view.whenLayerView(layer);
          //Create a div to store the results with a title.
          const groupDiv = document.createElement("div");
          groupDiv.className = "container";
          const layerTitle = document.createElement("h3");
          layerTitle.innerHTML = layer.title;
          groupDiv.appendChild(layerTitle);
          featureContainer.appendChild(groupDiv);
          //Loop trough the graphics
          data.forEach((graphic, j) => {
            //If the graphic comes from the current layer, process the results
            if (graphic.layer === layer) {
              //Highlight the feature
              if (
                layerView.layer.type === "feature" &&
                typeof layerView.highlight === "function" &&
                layer.title === "TITLE_OF_LAYER_TO_BE_HIGHTLIGHTED"
              ) {
                // console.log("Event3:", highlights.current.length) /////////////////////////////////////
                // console.log(highlights.current.length); ////////////////////////////////////////////////////
                const newHighlight = handles.add(layerView.highlight(graphic));
                highlights.current.push(newHighlight);
                highlighted = true;
                // console.log(highlights.current.length); ////////////////////////////////////////////////////
              }
              //Create a Feature widget from the API for each graphic
              const featureChild = new Feature({
                container: document.createElement("div"),
                graphic: graphic,
                map: view.map,
                spatialReference: view.spatialReference,
                defaultPopupTemplateEnabled: true,
              });
              //Package the results to pass down to Results
              groupDiv.appendChild(featureChild.container);
              const htmlPackage = document.createElement("div");
              htmlPackage.id = `resultContainer${i}_${j}`;
              htmlPackage.appendChild(groupDiv);
              tempHtmlPackages.current.push(htmlPackage);
            }
          });
        });
      }
      //Timeout to allow for data to be written to memory.
      //After timeout length, set HtmlPackages to tempHtmlPackages, triggering Results to re-render. If nothing was highlighted, clear old highlights else open the sidebar to reveal new results
      setTimeout(() => {
        setHtmlPackages(tempHtmlPackages.current);
        if (!highlighted) {
          clearHighlights();
        } else {
          getAppStore().dispatch(
            appActions.widgetStatePropChange(
              `widget_${sidebarId}`,
              "collapse",
              true
            )
          );
        }
      }, 1000);
    });
  }, [event]);

  return (
    <div>
      {htmlPackages.length > 0 ? (
        <Results message={htmlPackages}></Results>
      ) : (
        <div>
          {props.on ? (
            <p>&nbsp;&nbsp;No Results Found</p>
          ) : (
            <p>&nbsp;&nbsp;Enable switch to identify features.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Identify;
