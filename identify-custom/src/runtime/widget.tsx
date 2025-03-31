import { React, AllWidgetProps, getAppStore, appActions } from 'jimu-core'
import { MapViewManager, JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { Label, Switch } from 'jimu-ui'
import projection from 'esri/geometry/projection'
import Popup from 'esri/widgets/Popup'
import reactiveUtils from 'esri/core/reactiveUtils'
import Waiting from '../components/waiting'

const { useState, useEffect, useRef } = React

const Widget = (props: AllWidgetProps<any>) => {
  const sidebarId = props.config.sidebarWidgetId
  const viewManager = MapViewManager.getInstance()
  const mapView = viewManager.getJimuMapViewById(viewManager.getAllJimuMapViewIds()[0])
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(mapView)
  const [event, setEvent] = useState(null)
  const [container, setContainer] = useState(null)
  const [on, setOn] = useState(true)
  const eventListener = useRef(null)

  //Loads Popup and creates eventListener when mapView is created
  useEffect(() => {
    if (jimuMapView) {
      reactiveUtils
        .whenOnce(() => jimuMapView.view.ready)
        .then(() => {
          jimuMapView.view.popup = new Popup({
            defaultPopupTemplateEnabled: true,
            popupEnabled: true
          })
          eventListener.current = createEventListener()
        })}
  }, [jimuMapView])

  //Gets geometry from Search Widget and converts it to screen point
  useEffect(() => {
    if (props.mutableStateProps?.newSearch) {
      getAppStore().dispatch(appActions.widgetStatePropChange(`widget_${sidebarId}`, 'expand', true))
      //Timeout to wait for map to start moving.
      setTimeout(() => {
        reactiveUtils.when(() => jimuMapView.view.stationary && !jimuMapView.view.updating && props.mutableStateProps.newSearch, () => {
          projection.load().then(() => {
          //Converts geographic location to screen location and then destroys message to prevent infinite loop
            const screenPoint = jimuMapView.view.toScreen(props.mutableStateProps.newSearch)
            const featureContainer = document.getElementById('identifyDiv')
            featureContainer.innerHTML = ''
            setEvent(screenPoint)
            setContainer(featureContainer)
            props.mutableStateProps.newSearch = null
          })
        })
      }, 500)
    }
  }, [props.mutableStateProps?.newSearch])

  //Creates event listener that when clicked sets the event to the mouse point and closes the sidebar
  const createEventListener = () => {
    const eventListener = mapView.view.on('immediate-click', (event) => {
      const featureContainer = document.getElementById('identifyDiv')
      featureContainer.innerHTML = ''
      setEvent(event)
      setContainer(featureContainer)
      getAppStore().dispatch(appActions.widgetStatePropChange(`widget_${sidebarId}`, 'expand', true))
    })
    return eventListener
  }

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv)
    }
  }

  //Removes/creates event listener when off switch is clicked
  const handleSwitch = () => {
    if (on) {
      eventListener.current.remove()
      const featureContainer = document.getElementById('identifyDiv')
      featureContainer.innerHTML = ''
      //Delay closing sidebar for better UX.
      setTimeout(() => {
        getAppStore().dispatch(appActions.widgetStatePropChange(`widget_${sidebarId}`, 'collapse', false))
      }, 1000)
    } else {
      eventListener.current = createEventListener()
    }
    setOn(!on)
  }

  return (
        <div style={{ "height": "inherit", "overflow": "auto" }}>
            {
                props.useMapWidgetIds &&
                props.useMapWidgetIds.length === 1 && (
                    <JimuMapViewComponent
                        useMapWidgetId={props.useMapWidgetIds?.[0]}
                        onActiveViewChange={activeViewChangeHandler}
                    />
                )
            }
            <div className='d-flex justify-content-center mt-2'>
                <Label>
                    {on ? 'Disable Map Click Search Results' : 'Enable Map Click Search Results'}
                    <Switch
                        className='ml-2'
                        aria-label='Click Search Switch'
                        checked={on}
                        onChange={handleSwitch}
                    />
                </Label>
            </div>
            <div id='identifyDiv'>&nbsp;&nbsp;Click the map to identify features.</div>
            {event ?
                <Waiting
                    mapView={mapView}
                    event={event}
                    featureContainer={container}
                    on={on}
                    sidebarId={sidebarId}
                ></Waiting>
              : <div>
                    {on ?
                        <></>
                      : <p>Enable switch to identify features.</p>
                    }
                </div>
            }
        </div>
  )
}

export default Widget
