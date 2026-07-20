import React, { useMemo, useRef, useState } from "react"
import {
    Animated,
    FlatList,
    GestureResponderHandlers,
    LayoutAnimation,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native"

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

type DragHandleProps = GestureResponderHandlers

type ReferenceSectionProps<T> = {
    referenceItem: T
    items: T[]
    keyExtractor: (item: T) => string
    renderReference: (
        item: T,
        isDropTargetActive: boolean
    ) => React.ReactElement
    renderItem: (
        item: T,
        dragHandleProps: DragHandleProps
    ) => React.ReactElement
    onReferenceChange: (item: T) => void
    canSetReference?: (item: T) => boolean
    fromLabel?: string
    toLabel?: string
    emptyText?: string
    listFooter?: React.ReactElement | null
}

type Rect = {
    x: number
    y: number
    width: number
    height: number
}

export function ReferenceSection<T>({
    referenceItem,
    items,
    keyExtractor,
    renderReference,
    renderItem,
    onReferenceChange,
    canSetReference = () => true,
    fromLabel = "From",
    toLabel = "To",
    emptyText = "No items added",
    listFooter = null,
}: ReferenceSectionProps<T>) {
    const fromRef = useRef<View>(null)
    const fromScale = useRef(new Animated.Value(1)).current

    const [fromRect, setFromRect] = useState<Rect | null>(null)
    const [draggingKey, setDraggingKey] = useState<string | null>(null)
    const [isOverFrom, setIsOverFrom] = useState(false)
    const isOverFromRef = useRef(false)

    function measureFrom() {
        fromRef.current?.measureInWindow((x, y, width, height) => {
            setFromRect({ x, y, width, height })
        })
    }

    function pulseReference() {
        Animated.sequence([
            Animated.spring(fromScale, {
                toValue: 1.025,
                useNativeDriver: true,
                speed: 28,
                bounciness: 5,
            }),
            Animated.spring(fromScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 24,
                bounciness: 4,
            }),
        ]).start()
    }

    function isPointerInsideFrom(moveX: number, moveY: number) {
        if (!fromRect) return false

        const padding = 18

        return (
            moveX >= fromRect.x - padding &&
            moveX <= fromRect.x + fromRect.width + padding &&
            moveY >= fromRect.y - padding &&
            moveY <= fromRect.y + fromRect.height + padding
        )
    }

    const rows = useMemo(
        () =>
            items.map((item) => ({
                item,
                key: keyExtractor(item),
            })),
        [items, keyExtractor]
    )

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{fromLabel}</Text>

            <View
                ref={fromRef}
                onLayout={measureFrom}
                collapsable={false}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: fromScale }],
                    }}
                >
                    {renderReference(referenceItem, isOverFrom)}
                </Animated.View>
            </View>

            <Text style={[styles.sectionTitle, styles.toTitle]}>
                {toLabel}
            </Text>

            <FlatList
                data={rows}
                keyExtractor={(row) => row.key}
                scrollEnabled={!draggingKey}
                style={styles.list}
                removeClippedSubviews={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>{emptyText}</Text>
                }
                ListFooterComponent={listFooter}
                renderItem={({ item: row }) => (
                    <DraggableRow
                        disabled={!canSetReference(row.item)}
                        isDragging={draggingKey === row.key}
                        onDragStart={() => {
                            measureFrom()
                            setDraggingKey(row.key)
                        }}
                        onDragMove={(moveX, moveY) => {
                            const nextIsOverFrom = isPointerInsideFrom(
                                moveX,
                                moveY
                            )

                            if (nextIsOverFrom === isOverFromRef.current) {
                                return
                            }

                            isOverFromRef.current = nextIsOverFrom
                            setIsOverFrom(nextIsOverFrom)
                        }}
                        onDragEnd={(moveX, moveY) => {
                            const shouldChangeReference = isPointerInsideFrom(
                                moveX,
                                moveY
                            )

                            setDraggingKey(null)
                            isOverFromRef.current = false
                            setIsOverFrom(false)

                            if (!shouldChangeReference) return

                            LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                            )

                            onReferenceChange(row.item)
                            pulseReference()
                        }}
                        render={(dragHandleProps) =>
                            renderItem(row.item, dragHandleProps)
                        }
                    />
                )}
            />
        </View>
    )
}

type DraggableRowProps = {
    disabled: boolean
    isDragging: boolean
    onDragStart: () => void
    onDragMove: (moveX: number, moveY: number) => void
    onDragEnd: (moveX: number, moveY: number) => void
    render: (
        dragHandleProps: GestureResponderHandlers
    ) => React.ReactElement
}

function DraggableRow({
    disabled,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    render,
}: DraggableRowProps) {
    const position = useRef(new Animated.ValueXY()).current
    const scale = useRef(new Animated.Value(1)).current
    const callbacksRef = useRef({
        onDragStart,
        onDragMove,
        onDragEnd,
    })

    callbacksRef.current = {
        onDragStart,
        onDragMove,
        onDragEnd,
    }

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => !disabled,
                onMoveShouldSetPanResponder: () => !disabled,

                onPanResponderGrant: () => {
                    position.setOffset({
                        x: (position.x as any)._value,
                        y: (position.y as any)._value,
                    })

                    position.setValue({ x: 0, y: 0 })
                    callbacksRef.current.onDragStart()

                    Animated.spring(scale, {
                        toValue: 1.025,
                        useNativeDriver: true,
                        speed: 28,
                        bounciness: 4,
                    }).start()
                },

                onPanResponderMove: (_, gestureState) => {
                    position.setValue({
                        x: gestureState.dx,
                        y: gestureState.dy,
                    })

                    callbacksRef.current.onDragMove(
                        gestureState.moveX,
                        gestureState.moveY
                    )
                },

                onPanResponderRelease: (_, gestureState) => {
                    position.flattenOffset()

                    callbacksRef.current.onDragEnd(
                        gestureState.moveX,
                        gestureState.moveY
                    )

                    Animated.parallel([
                        Animated.spring(position, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: true,
                            speed: 24,
                            bounciness: 5,
                        }),
                        Animated.spring(scale, {
                            toValue: 1,
                            useNativeDriver: true,
                            speed: 24,
                            bounciness: 4,
                        }),
                    ]).start()
                },

                onPanResponderTerminate: () => {
                    position.flattenOffset()

                    callbacksRef.current.onDragEnd(
                        Number.NEGATIVE_INFINITY,
                        Number.NEGATIVE_INFINITY
                    )

                    Animated.parallel([
                        Animated.spring(position, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: true,
                        }),
                        Animated.spring(scale, {
                            toValue: 1,
                            useNativeDriver: true,
                        }),
                    ]).start()
                },
            }),
        [
            disabled,
            position,
            scale,
        ]
    )

    return (
        <Animated.View
            style={[
                styles.draggableRow,
                isDragging && styles.draggingRow,
                {
                    transform: [
                        { translateX: position.x },
                        { translateY: position.y },
                        { scale },
                    ],
                },
            ]}
        >
            {render(panResponder.panHandlers)}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "visible",
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
        marginTop: 20,
    },
    toTitle: {
        marginTop: 16,
        marginBottom: 0,
    },
    list: {
        overflow: "visible",
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 32,
        overflow: "visible",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        marginVertical: 24,
    },
    draggableRow: {
        zIndex: 1,
        overflow: "visible",
    },
    draggingRow: {
        zIndex: 1000,
        elevation: 20,
    },
})