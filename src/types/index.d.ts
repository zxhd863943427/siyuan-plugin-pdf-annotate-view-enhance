/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */

/**
 * Frequently used data structures in SiYuan
 */
type DocumentId = string;
type BlockId = string;
type NotebookId = string;
type PreviousID = BlockId;
type ParentID = BlockId | DocumentId;

type Notebook = {
    id: NotebookId;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

type NotebookConf = {
    name: string;
    closed: boolean;
    refCreateSavePath: string;
    createDocNameTemplate: string;
    dailyNoteSavePath: string;
    dailyNoteTemplatePath: string;
}

type BlockType = "d" | "s" | "h" | "t" | "i" | "p" | "f" | "audio" | "video" | "other";

type BlockSubType = "d1" | "d2" | "s1" | "s2" | "s3" | "t1" | "t2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "table" | "task" | "toggle" | "latex" | "quote" | "html" | "code" | "footnote" | "cite" | "collection" | "bookmark" | "attachment" | "comment" | "mindmap" | "spreadsheet" | "calendar" | "image" | "audio" | "video" | "other";

type Block = {
    id: BlockId;
    parent_id?: BlockId;
    root_id: DocumentId;
    hash: string;
    box: string;
    path: string;
    hpath: string;
    name: string;
    alias: string;
    memo: string;
    tag: string;
    content: string;
    fcontent?: string;
    markdown: string;
    length: number;
    type: BlockType;
    subtype: BlockSubType;
    ial?: { [key: string]: string };
    sort: number;
    created: string;
    updated: string;
}

type doOperation = {
    action: string;
    data: string;
    id: BlockId;
    parentID: BlockId | DocumentId;
    previousID: BlockId;
    retData: null;
}


type refBlock = {
    id:string,
    getAnnotationCoord:Function,
    floatLayer:floatLayer,
    refIDs:Array<string>
}

type floatLayer = {
    app:any,
    defIds:Array<defID>,
    editors:Array<any>,
    element:HTMLElement,
    id:string,
    isBacklink:any,
    nodeIds:Array<refID>,
    destroy:Function
}

type pageRefBlock = Array<refBlock>
type OnePdfRefBlock = Map<number, pageRefBlock>
type AllRefBlock = Map<string, OnePdfRefBlock>

type oneAnnotationData = {
    defId:string,
    refIDs:Array<refID>
}
type PageAnnotationData = Array<oneAnnotationData>
type OnePdfAnnotationData = Map<number,PageAnnotationData>
type AllAnnotationData = Map<String,OnePdfAnnotationData>
type refID = string
type defID = string