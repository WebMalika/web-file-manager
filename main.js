const app = Vue.createApp({
    data(){
        return {
            disk: [
                {
                    name: 'gfgrf',
                    type: 'dir',
                    isPrivate: false,
                    disk: []
                },
                {
                    name: 'index.php',
                    type: 'file'
                }
            ],
            curDisk: [
                {
                    name: 'gfgrf',
                    type: 'dir',
                    isPrivate: false,
                    disk: [
                        {
                            name: 'auywdgtagdsgdiua',
                            type: 'dir',
                            isPrivate: false,
                            disk: []
                        },
                        {
                            name: 'asKALOP',
                            type: 'dir',
                            isPrivate: true,
                            disk: []
                        },
                        {
                            name: 'SDAS.php',
                            type: 'file'
                        }
                    ]
                },
                {
                    name: 'index.php',
                    type: 'file'
                }
            ],
            isVisiblePrivateModal: false,
            isVisibleAddModal: false,
            typeAddObj: null,
            visiblePath: '/',
            originalPath: null,
            textAddModal: ''
        }
    },
    methods: {
        toFolder(key) {
            console.log(this.curDisk);
            if(!this.curDisk[key].isPrivate && this.curDisk[key].disk){
                this.visiblePath += this.curDisk[key].name + '/'
                this.curDisk = this.curDisk[key].disk

            } else {

            }
            console.log(this.curDisk);
        },
        visibleModal(typeAddObj){
            this.typeAddObj = typeAddObj;
            
            if(typeAddObj == 'dir')
                this.textAddModal = "Добавить папку";
            else if(typeAddObj == 'file')
                this.textAddModal = "Добавить файл";

            if(!this.isVisibleAddModal){
                this.isVisibleAddModal = true;
            }
        },
        addNewObj(){
            let name = this.$refs.objName.value,
                isPrivate = this.$refs.objPrivate.checked ? true : false;
            
            if(!name){
                this.$refs.modal__error.innerHTML = `<span class='fatal__error'><b>Ошибка!</b> Вы не ввели названия!</span>`
                this.$refs.objName.classList.add('field_error');
                return;
            }
            
            if(this.typeAddObj == 'dir')
                this.curDisk.push({
                    name: name,
                    type: this.typeAddObj,
                    isPrivate: isPrivate,
                    disk: []
                });
            else 
                this.curDisk.push({
                    name: name,
                    type: this.typeAddObj,
                    isPrivate: isPrivate
                });

            this.isVisibleAddModal = false;
            this.$refs.modal__error.innerHTML = '';
            this.$refs.objName.classList.remove('field_error');
        }
    }
})

app.mount('#app');