const _codeFolderData = [
    {
        id: 1,
        name: "代码目录",
        children: [
            {
                id: 2,
                name: "src",
                children: [
                    {
                        id: 3,
                        name: "main",
                        children: [
                            {
                                id: 4,
                                name: "java",
                                children: [
                                    {
                                        id: 7,
                                        name: "com.hotent.test",
                                        children: [
                                            {
                                                id: 8,
                                                name: "controller",
                                                children: [{ id: 9, name: "XXXController.java" }]
                                            },
                                            {
                                                id: 10,
                                                name: "dao",
                                                children: [{ id: 11, name: "XXXDao.java" }]
                                            },
                                            {
                                                id: 12,
                                                name: "manager",
                                                children: [
                                                    {
                                                        id: 16,
                                                        name: "impl",
                                                        children: [
                                                            { id: 17, name: "XXXManagerImpl.java" }
                                                        ]
                                                    },
                                                    { id: 13, name: "XXXManager.java" }
                                                ]
                                            },
                                            {
                                                id: 14,
                                                name: "model",
                                                children: [{ id: 15, name: "XXX.java" }]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 5,
                                name: "resources",
                                children: [
                                    {
                                        id: 18,
                                        name: "mapper",
                                        children: [{ id: 19, name: "XXXMapper.xml" }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            { id: 6, name: "web", children: [{ id: 20, name: "src", children: [{ id: 21, name: "views", children: [{ id: 22, name: "XXXManager.vue" }] }] }] }
        ]
    }
];

export default {
    name: "codeFolderData",
    getData() {
        return _codeFolderData;
    }
}