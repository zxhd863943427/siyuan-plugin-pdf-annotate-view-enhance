export function getModelsById(id:string){
    const models = [];
    const getTabs = (layout) => {
        for (let i = 0; i < layout.children.length; i++) {
            const item = layout.children[i];
            // 没有children则认为是tab
            if (!item.children) {
                const model = item.model;
                if (item.id === id) {
                    models.push(model)
                }

            } else {
                getTabs(item);
            }
        }
    };

    if (window.siyuan.layout.layout) {
        getTabs(window.siyuan.layout.layout);
    }
    return models;
}