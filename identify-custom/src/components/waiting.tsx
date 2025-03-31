import { React } from 'jimu-core'
import { Loading } from 'jimu-ui'
import reactiveUtils from 'esri/core/reactiveUtils'
import Identify from './identify'

const { useState, useEffect } = React

const Waiting = (props) => {

    const [ready, setReady] = useState(false)
    const mapView = props.mapView

    useEffect(() => {
        //If triggered by mouse click go to Identify, else wait for map layers to load
        if (props.event.eventId) {
            setReady(true)
        } else {
            //Count the number of feature layers and set a reactiveUtils on each one
            setReady(false)
            let numFeature = 0
            let featureReady = 0
            mapView.view.allLayerViews.forEach(layerView => {
                if (layerView.layer.type === 'feature' && layerView.layer.visible) {
                    numFeature++
                    reactiveUtils.once(() => layerView.updating === false).then(() => {
                        featureReady++
                        //If the number of feature layers reporting ready equals the total, proceed to Identify
                        if (featureReady === numFeature) {
                            setReady(true)
                        }
                    })
                }
            })
            //If no feature layers, proceed to Identify
            if (!numFeature) {
                setReady(true)
            }
            //I don't understand why this call to setReady works, but Identify will never be called after the first search without it.
            setReady(true)
        }
    }, [props.event])

    return (
        <div>
            {
                ready ?
                    <Identify
                        mapView={mapView}
                        event={props.event}
                        featureContainer={props.featureContainer}
                        on={props.on}
                        sidebarId={props.sidebarId}>
                    </Identify>
                : <Loading></Loading>
            }
        </div>
    )
}

export default Waiting