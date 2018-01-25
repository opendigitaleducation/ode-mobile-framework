import * as React from "react"
import { FlatList, View } from "react-native"
import { IThreadModel } from "../../model/Thread"
import styles from "../styles/index"
import { Thread } from "./Thread"
import { tryUpScroll } from "../../utils/ExpandCollapse"

export interface ThreadsProps {
	navigation?: any
	readConversation: (idConverstion: number) => void
	threads: IThreadModel[]
	userId: string
}

export class Threads extends React.Component<ThreadsProps, any> {
	static tryUpScroll = 0
	today: boolean = false
	private renderItem(item: IThreadModel) {
		if (!this.props.userId) return <View />

		return <Thread {...item} userId={this.props.userId} />
	}

	public render() {
		const { navigation, threads } = this.props

		return (
			<FlatList
				data={threads}
				keyExtractor={item => item.id}
				onScroll={({ nativeEvent }) => {
					tryUpScroll(navigation, nativeEvent)
				}}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}
