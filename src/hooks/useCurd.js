export default function useCurd({ addFn, updateFn, removeFn, retrieveFn }) {
  // because `delete` is reserve word instead use `remove` here
  const remove = function(scope) {
    this._delete([scope.row.id]).then(res => {
      if (res.data?.data?.code) {
        switch (res.data?.data?.code) {
          case 1001:
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getRecords()
            break
          case 1002:
            this.$message({
              message: res.data?.data?.info,
              type: 'warning'
            })
            break
        }
      }
    })
  }

  const removeBatch = function() {
    const ids = this.$refs.table.getSelection().reduce((acc, val) => {
      acc.push(val.id)
      return acc
    }, [])
    this._delete(ids).then(res => {
      if (res.data?.data?.code) {
        switch (res.data?.data?.code) {
          case 1001:
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getRecords()
            break
          case 1002:
            this.$confirm(`${res.data?.data?.info} <p> 是否取消勾选引用的题目? </p>`, '无法删除', {
              type: 'warning',
              dangerouslyUseHTMLString: true
            }).then(() => {
              const canotRemoveids = res.data?.data?.ids
              const toggleRows = []
              this.$refs.table.getSelection().forEach(item => {
                if (canotRemoveids.indexOf(item.id) >= 0) {
                  toggleRows.push(item)
                }
              })

              toggleRows.forEach(row => this.$refs.table.$table.toggleRowSelection(row, false))
            }).catch(() => {})
            break
        }
      }
    })
  }
  const _remove = function(ids) {
    return this.$refs.confirmDelete.prompt().then(() => {
      return removeFn({
        data: {
          type: 1,
          ids: ids
        }
      }).then((res) => {
        if (!res.data?.data?.code) {
          this.getRecords()
        }
        return res
      })
    })
  }
  return {
    delete: remove,
    deleteBatch: removeBatch,
    _delete: _remove
  }
}
