/** @jsx jsx */
import { jsx, type DataSourceJson, css, type ImmutableArray } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { type SearchDataConfig, SearchDataSetting, SearchDataType } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, SearchServiceType } from '../config'
import { TextInput, Label } from 'jimu-ui'
import SearchResultSetting from './component/search-setting-option'
import ArrangementStyleSetting from './component/arrangement-style'

interface ExtraProps {
  id: string
}

type SettingProps = AllWidgetSettingProps<IMConfig> & ExtraProps

const Setting = (props: SettingProps) => {
  const { config, id, portalUrl, onSettingChange, useDataSources } = props

  const SYLE = css`
    .suggestion-setting-con  {
      padding-bottom: 0;
    }
  `

  const onDataSettingChange = (datasourceConfig: ImmutableArray<SearchDataConfig>, dsInWidgetJson) => {
    if (!datasourceConfig) return false
    const appConfigAction = getAppConfigAction()
    const newConfig = config?.setIn(['datasourceConfig'], datasourceConfig)
    let newWidgetJson = { id, config: newConfig }
    if (dsInWidgetJson?.isWidgetJsonDsChanged && dsInWidgetJson?.dsInWidgetJson) {
      newWidgetJson = {
        ...newWidgetJson,
        ...dsInWidgetJson?.dsInWidgetJson
      }
    }
    appConfigAction.editWidget(newWidgetJson).exec()
  }

  const createOutputDs = (outputDsJsonList: DataSourceJson[], datasourceConfig: ImmutableArray<SearchDataConfig>, dsInWidgetJson) => {
    if (!datasourceConfig) return false
    const newConfig = config?.setIn(['datasourceConfig'], datasourceConfig)
    let newWidgetJson = {
      id,
      config: newConfig,
      useUtilities: getUseUtilities(newConfig)
    }
    if (dsInWidgetJson?.isWidgetJsonDsChanged && dsInWidgetJson?.dsInWidgetJson) {
      newWidgetJson = {
        ...newWidgetJson,
        ...dsInWidgetJson?.dsInWidgetJson
      }
    }
    const appConfigAction = getAppConfigAction()
    appConfigAction.editWidget(newWidgetJson, outputDsJsonList).exec()
  }

  const getUseUtilities = (config: IMConfig) => {
    const useUtilities = []
    config?.datasourceConfig?.forEach(configItem => {
      if (configItem?.searchServiceType === SearchServiceType.GeocodeService) {
        useUtilities.push(configItem?.useUtility)
      }
    })
    return useUtilities
  }
  
  const handleIdentifyId = (value: string) => {
    onSettingChange({ id: id, config: config.set('identifyWidgetId', value) })
  }

  const handleEnableFilteringChange = (value: boolean) => {
    onSettingChange({ id: id, config: config.set('enableFiltering', value) })
  }

  return (
    <div className='widget-setting-search jimu-widget-search' css={SYLE}>
    <div className='w-100'>
      <p>This Search widget is designed to work with a Locator source. It should also work with a layer with point type geometry. Additional customization is necessary to use with other data sources. It must be used with a Map Widget and the Record Selection Changes > Zoom To Action must be set.</p>
      <Label className='w-100'>
          Identify Widget Id Number:
          <TextInput
          className="w-100"
           allowClear
           onAcceptValue={(value) => handleIdentifyId(value)}
           size="default"
           type="text"
           placeholder="Widget Id Number Of Identify"
           defaultValue={props.config.identifyWidgetId}
          />
      </Label>
      </div>

      <SearchDataSetting
        id={id}
        portalUrl={portalUrl}
        useDataSources={useDataSources}
        createOutputDs={true}
        onSettingChange={onDataSettingChange}
        onOutputDsSettingChange={createOutputDs}
        datasourceConfig={config?.datasourceConfig}
        searchDataSettingType={SearchDataType.Both}
        enableFiltering={config?.enableFiltering}
        onEnableFilteringChange={handleEnableFilteringChange}
      />
      <SearchResultSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
        useDataSources={useDataSources}
      />
      <ArrangementStyleSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
      />
    </div>
  )
}

export default Setting
