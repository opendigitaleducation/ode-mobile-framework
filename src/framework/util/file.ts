/**
 * Global File Manager
 */

import { Platform } from "react-native";
import DocumentPicker, { DocumentPickerResponse, DocumentType, PlatformTypes } from "react-native-document-picker";

namespace LocalFile {

    export type IPickOptionsType = 'image' | 'audio' | 'video';
    export interface IPickOptions {
        source: 'documents' | 'galery',
        multiple: boolean,
        type?: IPickOptionsType | IPickOptionsType[]
    }
}
export class LocalFile {

    static _getTypeArg<OS extends keyof PlatformTypes>(type: LocalFile.IPickOptionsType | LocalFile.IPickOptionsType[] | undefined)
        : Array<PlatformTypes[OS][keyof PlatformTypes[OS]]> {
        const getType = (type: LocalFile.IPickOptionsType) => Platform.select(({
            'image': { ios: 'public.image', android: 'image/*' },
            'audio': { ios: 'public.audio', android: 'audio/*' },
            'video': { ios: 'public.movie', android: 'video/*' }
        }[type]))! as unknown as PlatformTypes[OS][keyof PlatformTypes[OS]]; // Assumes OS is either iOS or Android.

        return type !== undefined
            ? Array.isArray(type)
                ? type.map(t => getType(t))
                : [getType(type)]
            : [Platform.select({ ios: 'public.item', android: '*/*' })! as unknown as PlatformTypes[OS][keyof PlatformTypes[OS]]]
    }

    static async pick(opts: LocalFile.IPickOptions) {
        let pickedFiles: DocumentPickerResponse[] = [];
        if (opts.source === 'documents') {
            if (opts.multiple) {
                console.log("will pick Multiple")
                pickedFiles = await DocumentPicker.pickMultiple({
                    type: LocalFile._getTypeArg(opts.type)
                });
            } else {
                console.log("will pick Single")
                pickedFiles = [await DocumentPicker.pick({
                    type: LocalFile._getTypeArg(opts.type)
                })];
            }
        } else /* if (opts.source === 'galery') */ {

        }
        console.log(pickedFiles);
    }

}