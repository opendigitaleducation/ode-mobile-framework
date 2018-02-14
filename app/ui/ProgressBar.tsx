import * as React from "react"
import { View } from "react-native"
import styles, { deviceWidth } from "../styles/index"

function isLoading(synced) {
	if (synced === undefined) {
		return false
	}
	return synced.reduce((acc, elemIsSync) => acc || !elemIsSync, false)
}

interface ProgressBarState {
	width?: number
}

export interface ProgressBarProps {
	synced: boolean[]
}

export class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState> {
	public state: ProgressBarState = {
		width: 0,
	}
	public timerID = null

	public componentWillReceiveProps(newProps) {
		if (isLoading(newProps.synced)) {
			this.timerID = setInterval(
				() =>
					this.setState({
						width: (this.state.width + deviceWidth / 10) % deviceWidth,
					}),
				400
			)
		}

		if (!isLoading(newProps.synced)) {
			clearInterval(this.timerID)
		}
	}

	public render() {
		const { synced } = this.props

		return isLoading(synced) ? <View style={[styles.loading, { width: this.state.width }]} /> : <View />
	}
}
