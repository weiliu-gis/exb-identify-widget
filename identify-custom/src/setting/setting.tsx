import { React } from 'jimu-core'
import { Label, NumericInput } from 'jimu-ui'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'

const Setting = (props: AllWidgetSettingProps<any>) => {

    const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
        props.onSettingChange({
            id: props.id,
            useMapWidgetIds: useMapWidgetIds
        })
    }

    const handleSidebarId = (value: number) => {
        props.onSettingChange({
            id: props.id,
            config: props.config.set('sidebarWidgetId', value)
        })
    }

    return (
        <div className="widget-setting">
            <p>This widget must be used with a Map Widget.</p>
            <MapWidgetSelector
                useMapWidgetIds={props.useMapWidgetIds}
                onSelect={onMapWidgetSelected}
            />
            <hr></hr>
            <p>To use with the related Search Widget, enter the number in the id below to the Settings Panel of the Search Widget. Use with the Search Widget is optional.</p>
            <h3>This widget id: {props.widgetId}</h3>
            <hr></hr>
            <p>This widget works best in a Sidebar. You will need to enter the id of the Sidebar Widget it is placed in below for the auto-opening/closing Sidebar feature to work. The widget should not error if this value is blank or incorrect.</p>
            <Label className='w-100'>
                Sidebar Widget Id Number:
                <NumericInput
                    className="w-100"
                    onAcceptValue={(value) => handleSidebarId(value)}
                    size="default"
                    placeholder="Widget Id Number Of Sidebar"
                    defaultValue={props.config.sidebarWidgetId}
                    step={1}
                    precision={0}
                    min={1}
                />
            </Label>
        </div>
    )
}

export default Setting